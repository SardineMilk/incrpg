import { LogType } from "../game/log.js";
import { LOCATIONS } from "../data/locationsData.js";
import { currentContext } from "../utils/context.js";
import { getActiveAction } from "../utils/getActiveAction.js";
/*
 * Each entry defines one effect type:
 *
 *   create(...args) -> effect plain-object  (used as eff.fooBar() in data files)
 *   apply(game, resolvedEffect) -> triggerDescriptor | null
 *   remove?(game, resolvedEffect) -> void
 *   scale?(game, effect, multiplier) -> scaled copy of effect
 *
 * If the apply() method returns a string,
 * It fires that event, using the effect as context 
 *
 * Effects with a `remove` method are reversible.
 * Effects without `remove` are fire-and-forget (tick effects, one-time rewards).
 */

function scaleAmount(game, effect, mul) {
  const prev = effect.amount;
  return {
    ...effect,
    amount: (g) => (typeof prev === "function" ? prev(g) : prev) * mul,
  };
}

function scaleStatLayer(game, effect, mul) {
  const prevFlat = effect.flat;
  return {
    ...effect,
    flat: (g) => (typeof prevFlat === "function" ? prevFlat(g) : prevFlat) * mul,
  };
}


// Condition helper functions

function getStrength(c) {
  return c.strengthHolder ? c.strengthHolder.value : 1;
}

function activateCondition(game, c, duration = null) {
  if (!c) return;
  if (c.activeHolder.active) return;
  if (c.effectHolder) c.effectHolder.apply(game, getStrength(c));
  c.activeHolder.activate(duration);
  
}
 
function deactivateCondition(game, c) {
  if (!c) return;
  if (!c.activeHolder.active) return;
  if (c.effectHolder) c.effectHolder.remove(game, getStrength(c));
  c.activeHolder.deactivate();
}


export const EFFECT_DEFS = {
  // Modifiers
  // TODO - static validator check these aren't used in trigger, only modifier block
  modifyAmount: {
    create: (amount) => ({type:"modifyAmount", amount}),
    apply(game, e) {
      currentContext().amount += e.amount; 
    }
  },



  // ── Skills ────────────────────────────────────────────────────────────────

  gainSkillXp: {
    create: (skill, amount) => ({ type: "gainSkillXp", skill, amount }),
    apply(game, e) {
      if (e.skill == null) return null;
      if (e.amount == 0) return;
      game.skills[e.skill].progressionHolder.gainXp(game, e.amount);
      return "gainSkillXp";
    },
    scale: scaleAmount,
    display(game, e) {
      return `gain ${e.amount} xp in ${e.skill}`
    }
  },

  skillXpMultiplier: {
    create: (skill, {flat = 0, percent = 0, multiplier = 1 } = {}) => ({ 
      type: "skillXpMultiplier", 
      skill, 
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      if (e.skill == null) return null;
      game.skills[e.skill].progressionHolder.xpBonus.change(e);
    },
    remove(game, e) {
      if (e.skill == null) return;
      game.skills[e.skill].progressionHolder.xpBonus.changeReverse(e);
    },
    scale: scaleAmount,
    display(game, e) {
      let m = `increase ${e.skill} xp gain multiplier by: `
      if (e.flat != 0) m += `+${e.flat} `;
      if (e.percent != 0) m += `${e.percent}% `;
      if (e.multiplier != 1) m += `x${e.multiplier} `;
      return m;
    }
  },

  skillLevelBonus: {
    create: (skill, {flat = 0, percent = 0, multiplier = 1 } = {}) => ({
      type: "skillLevelBonus",
      skill,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      game.skills[e.skill].progressionHolder.levelBonus.change(e);
    },
    remove(game, e) {
      game.skills[e.skill].progressionHolder.levelBonus.changeReverse(e);
    },
    display(game, e) {
      let m = `increase ${e.skill} level by: `
      if (e.flat != 0) m += `+${e.flat} `;
      if (e.percent != 0) m += `${e.percent}% `;
      if (e.multiplier != 1) m += `x${e.multiplier} `;
      return m;
    }
  },

  // ── Conditions ────────────────────────────────────────────────────────────

  activateCondition: {
    create: (condition) => ({
      type: "activateCondition",
      condition,
    }),
    apply(game, e) {
      const c = game.conditionStates[e.condition];
      activateCondition(game, c, null);
      return "conditionApplied";
    },
    remove(game, e) {
      const c = game.conditionStates[e.condition];
      deactivateCondition(game, c);
    },
    display(game, e) {
      return `gain ${e.condition} permanently`;
    }
  },

  deactivateCondition: {
    create: (condition) => ({
      type: "deactivateCondition",
      condition,
    }),
    apply(game, e) {
      const c = game.conditionStates[e.condition];
      deactivateCondition(game, c);
    },
    remove(game, e) {
      const c = game.conditionStates[e.condition];
      activateCondition(game, c, null);
    },
    display(game, e) {
      return `remove ${e.condition}`;
    }
  },

  applyConditionDuration: {
    create: (condition, amount) => ({
      type: "applyConditionDuration",
      condition,
      amount,
    }),
    apply(game, e) {
      const c = game.conditionStates[e.condition];

      // This activates condition if deactivated, does nothing if already active
      activateCondition(game, c, 0);
 
      const expired = c.activeHolder.changeDuration(e.amount);
      if (expired) deactivateCondition(game, c);
 
      return "conditionApplied";
    },
    remove(game, e) {
      const c = game.conditionStates[e.condition];
      if (!c.activeHolder.active) return;
 
      const expired = c.activeHolder.changeDuration(-e.amount);
      if (expired) deactivateCondition(game, c);
    },
    display(game, e) {
      return `gain ${e.condition} for ${e.amount} turns`;
    }
  },
 
  // System effect: ticks down every currently active, timed condition by 1.
  // TODO - this shouldnt need a custom effect
  decayConditionDurations: {
    create: () => ({ type: "decayConditionDurations" }),
    apply(game, e) {
      for (const id in game.conditionStates) {
        const c = game.conditionStates[id];
        if (!c.activeHolder.isTimed) continue;
 
        const expired = c.activeHolder.changeDuration(-1);
        if (expired) deactivateCondition(game, c);
      }
      return null;
    },
    display(game, e) {
      return `tick down active condition durations`;
    }
  },
 
  changeConditionStrength: {
    create: (condition, { flat = 0, percent = 0, multiplier = 1 } = {}) => ({
      type: "changeConditionStrength",
      condition,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      const c = game.conditionStates[e.condition];
      if (!c) return null;
 
      c.strengthHolder.change(e);
      if (c.effectHolder) {
        c.effectHolder.reapply(game, c.strengthHolder.value);
      }
 
      return "conditionStrengthChanged";
    },
    remove(game, e) {
      const c = game.conditionStates[e.condition];
      if (!c) return;
 
      c.strengthHolder.changeReverse(e);
 
    },
    scale: scaleStatLayer,
    display(game, e) {
      let m = `modify ${e.condition} strength by: `;
      if (e.flat != 0) m += `+${e.flat} `;
      if (e.percent != 0) m += `${e.percent}% `;
      if (e.multiplier != 1) m += `x${e.multiplier} `;
      return m;
    }
  },

  // ── Values ────────────────────────────────────────────────────────────────

  changeValue: {
    create: (value, amount) => ({ type: "changeValue", value, amount }),
    apply(game, e) {
      game.values[e.value] = game.values[e.value] || 0;
      game.values[e.value] += e.amount;
      if (e.amount > 0) return "valueGain";
      if (e.amount < 0) return "valueLoss";
      return null;
    },
    remove(game, e) {
      game.values[e.value] -= e.amount;
    },
    scale: scaleAmount,
    display(game, e) {
      return `${e.amount > 0 ? 'gain' : 'lose'} ${Math.abs(e.amount)} ${e.value}`;
    }
  },

  setValue: {
    create: (value, amount) => ({ type: "setValue", value, amount }),
    apply(game, e) {
      game.values[e.value] = e.amount;
    },
    display(game, e) {
      return `set ${e.value} to ${e.amount}`;
    }
  },

  removeValue: {
    create: (value) => ({ type: "removeValue", value }),
    apply(game, e) {
      delete game.values[e.value];
    },
    display(game, e) {
      return `remove value ${e.value}`;
    }
  },

  // ── Attributes ────────────────────────────────────────────────────────────

  changeAttribute: {
    create: (attribute, { flat = 0, percent = 0, multiplier = 1 } = {}) => ({
      type: "changeAttribute",
      attribute,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      game.attributes[e.attribute] ??= new StatLayer();
      game.attributes[e.attribute].change(e);
    },
    remove(game, e) {
      game.attributes[e.attribute].changeReverse(e);
    },
    scale: scaleStatLayer,
    display(game, e) {
      let m = `modify ${e.attribute} by: `;
      if (e.flat != 0) m += `+${e.flat} `;
      if (e.percent != 0) m += `${e.percent}% `;
      if (e.multiplier != 1) m += `x${e.multiplier} `;
      return m;
    }
  },

  setAttribute: {
    create: (attribute, { flat = 0, percent = 0, multiplier = 1 } = {}) => ({
      type: "setAttribute",
      attribute,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      game.attributes[e.attribute] ??= new StatLayer();
      game.attributes[e.attribute].set(e);
    },
    scale: scaleStatLayer,
    display(game, e) {
      return `set ${e.attribute} to flat=${e.flat}, percent=${e.percent}, multiplier=${e.multiplier}`;
    }
  },

  removeAttribute: {
    create: (attribute) => ({ type: "removeAttribute", attribute }),
    apply(game, e) {
      delete game.attributes[e.attribute];
    },
    display(game, e) {
      return `remove attribute ${e.attribute}`;
    }
  },

  // ── Activity ──────────────────────────────────────────────────────────────

  activityProgress: {
    create: (amount) => ({ type: "activityProgress", amount }),
    apply(game, e) {
      game.values.activityProgress += e.amount;
      return null;
    },
    scale: scaleAmount,
    display(game, e) {
      return `add ${e.amount} activity progress`;
    }
  },

  actionProgress: {
    create: (amount) => ({ type: "actionProgress", amount }),
    apply(game, e) {
      const state = game.actionStates[getActiveAction()];
      state.completableHolder.advanceProgress(game, e.amount);
      return null;
    },
    scale: scaleAmount,
    display(game, e) {
      return `add ${e.amount} progress to the current action`;
    }
  },

  // ── World ─────────────────────────────────────────────────────────────────

  setLocation: {
    create: (location) => ({ type: "setLocation", location }),
    apply(game, e) {
      game.location = e.location;
      const tags = LOCATIONS[e.location]?.tags ?? [];
      return "locationChanges";
    },
    display(game, e) {
      return `move to ${e.location}`;
    }
  },

  activateAction: {
    create: (action) => ({ type: "activateAction", action }),
    apply(game, e) {
      const a = game.actionStates[e.action];
      activateCondition(game, a, null);
      return "actionChanged";
    },
    display(game, e) {
      return `start action ${e.action}`;
    }
  },

  deactivateAction: {
    create: (action) => ({ type: "deactivateAction", action }),
    apply(game, e) {
      const a = game.actionStates[e.action];
      deactivateCondition(game, a);
    },
  },


  // ── UI / Log ──────────────────────────────────────────────────────────────

  sendMessage: {
    create: (category, message) => ({ type: "sendMessage", category, message }),
    apply(game, e) {
      game.log.append(LogType.ACTION, e.message);
    },
    display(game, e) {
      return `send message: "${e.message}"`;
    }
  },

  presentChoice: {
    create: (options) => ({ type: "presentChoice", options }),
    apply(game, e) {
      game.log.append(LogType.ACTION, e.options);
    },
    display(game, e) {
      return `present choice with ${Array.isArray(e.options) ? e.options.length : 1} option(s)`;
    }
  },

  // ── Misc ──────────────────────────────────────────────────────────────────

  setFlag: {
    create: (flag, value) => ({ type: "setFlag", flag, value }),
    apply(game, e) {
      game.flags[e.flag] = e.value;
    },
    display(game, e) {
      return `set flag ${e.flag} to ${e.value}`;
    }
  },

  forceTrigger: {
    create: (trigger) => ({ type: "forceTrigger", trigger }),
    apply(game, e) {
      return e.trigger;
    },
    display(game, e) {
      return `force trigger ${e.trigger}`;
    }
  },

  log: {
    create: (str) => ({ type: "log", str }),
    apply(game, e) {
      console.log(e.str);
    },
    display(game, e) {
      return `log to console: "${e.str}"`;
    }
  },
};

export const eff = Object.fromEntries(
  Object.entries(EFFECT_DEFS).map(([key, def]) => [key, def.create]),
);