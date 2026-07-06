import { LogType } from "../game/log.js";
import { LOCATIONS } from "../data/locationsData.js";

/*
 * Each entry defines one effect type:
 *
 *   create(...args) -> effect plain-object  (used as eff.fooBar() in data files)
 *   apply(game, resolvedEffect) -> triggerDescriptor | null
 *   remove?(game, resolvedEffect) -> void
 *   scale?(game, effect, multiplier) -> scaled copy of effect
 *
 * triggerDescriptor:
 *   - a string          -> fire that trigger type, using the effect as context
 *   - { type, context } -> fire with a custom context object
 *   - null / undefined  -> no trigger
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

export const EFFECT_DEFS = {
  // ── Skills ────────────────────────────────────────────────────────────────

  grantSkillXp: {
    create: (skill, amount) => ({ type: "grantSkillXp", skill, amount }),
    apply(game, e) {
      if (e.skill == null) return null;
      if (e.amount == 0) return;
      game.skills[e.skill].progressionHolder.grantXp(game, e.amount)
      return "gainSkillXp";
    },
    scale: scaleAmount,
    display(game, e) {
      // TODO
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

  applyCondition: {
    create: (condition, amount = null) => ({
      type: "applyCondition",
      condition,
      amount,
    }),
    apply(game, e) {
      const state = game.conditionStates[e.condition];
      if (!state.active) state.new = true;

      state.active = true;
      if (e.amount == null) state.duration = null;
      else state.duration += e.amount;

      return "conditionApplied";
    },
    remove(game, e) {
      const state = game.conditionStates[e.condition];
      if (!state.active) return;
      if (state.duration == null && e.duration == null) {
        state.duration = -1;
      };
      if (state.duration == null || e.duration == null) {
        return;
      }
      state.duration -= e.duration;
    },
    display(game, e) {
      if (e.amount == null) return `gain ${e.condition} permanently`;
      return `gain ${e.condition} for ${e.amount} turns`;
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
      const state = game.actionStates[game.activeAction];
      state.completableHolder.advanceProgress(e.amount);
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
      return { type: "locationChanges", context: { ...e, tags } };
    },
    display(game, e) {
      return `move to ${e.location}`;
    }
  },

  setActiveAction: {
    create: (action) => ({ type: "setActiveAction", action }),
    apply(game, e) {
      const didChange = (game.activeAction !== e.action);
      game.activeAction = e.action;
      return didChange ? "actionChanges" : null;
    },
    display(game, e) {
      return `start action ${e.action}`;
    }
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