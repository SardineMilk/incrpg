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
  const prevPerc = effect.percent;
  const prevMult = effect.multiplier;
  return {
    ...effect,
    flat: (g)       => (typeof prevFlat === "function" ? prevFlat(g) : prevFlat) * mul,
    percent: (g)    => (((typeof prevFlat === "function" ? prevPerc(g) : prevPerc)-1) * mul) + 1,
    multiplier: (g) => (((typeof prevFlat === "function" ? prevMult(g) : prevMult)-1) * mul) + 1,
  };
}


function getStrength(game, entity) {
  return (
    game.registry.get(entity, "StatLayer")?.value ?? 1
  );
}


function activateEntity(game, entity, duration = null) {
  const active = game.registry.get(entity, "ActiveHolder");
  if (!active) return;
  if (active.active) return;

  const effects = game.registry.get(entity, "PassiveHolder");
  if (effects) effects.apply(game, getStrength(game, entity));
  active.activate(duration);
}


function deactivateEntity(game, entity) {
  const active = game.registry.get(entity, "ActiveHolder");
  if (!active) return;
  if (!active.active) return;

  const effects = game.registry.get(entity, "PassiveHolder");
  if (effects) effects.remove(game, getStrength(game, entity));
  active.deactivate();
}


export const EFFECT_DEFS = {
  // Modifiers
  // TODO - static validator check these aren't used in trigger, only modifier block
  modifyAmount: {
    create: (amount) => ({ type: "modifyAmount", amount }),
    apply(game, e) {
      currentContext().amount += e.amount;
    }
  },


  // ── LevelHolder ────────────────────────────────────────────────────────────────

  gainXp: {
    create: (id, amount) => ({ type: "gainXp", id, amount }),
    apply(game, e) {
      if (e.id == null) return null;
      if (e.amount == 0) return;

      game.registry
        .get(e.id, "LevelHolder")
        .gainXp(game, e.amount);

      return "gainXp";
    },
    scale: scaleAmount,
    display(game, e) {
      return `gain ${e.amount} xp in ${e.id}`;
    }
  },

  xpMultiplier: {
    create: (id, { flat = 0, percent = 0, multiplier = 1 } = {}) => ({
      type: "xpMultiplier",
      id,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      if (e.idl == null) return;

      game.registry
        .get(e.id, "LevelHolder")
        .xpBonus
        .change(e);
    },
    remove(game, e) {
      if (e.id == null) return;

      game.registry
        .get(e.id, "LevelHolder")
        .xpBonus
        .changeReverse(e);
    },
    scale: scaleAmount,
    display(game, e) {
      let m = `increase ${e.id} xp gain multiplier by: `;
      if (e.flat != 0) m += `+${e.flat} `;
      if (e.percent != 0) m += `${e.percent}% `;
      if (e.multiplier != 1) m += `x${e.multiplier} `;
      return m;
    }
  },

  levelBonus: {
    create: (id, { flat = 0, percent = 0, multiplier = 1 } = {}) => ({
      type: "levelBonus",
      id,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      game.registry
        .get(e.id, "LevelHolder")
        .levelBonus
        .change(e);
    },
    remove(game, e) {
      game.registry
        .get(e.id, "LevelHolder")
        .levelBonus
        .changeReverse(e);
    },
    scale: scaleStatLayer,
    display(game, e) {
      let m = `increase ${e.id} level by: `;
      if (e.flat != 0) m += `+${e.flat} `;
      if (e.percent != 0) m += `${e.percent}% `;
      if (e.multiplier != 1) m += `x${e.multiplier} `;
      return m;
    }
  },


  // ── ActiveHolder ────────────────────────────────────────────────────────────

  activate: {
    create: (id) => ({
      type: "activate",
      id,
    }),
    apply(game, e) {
      activateEntity(game, e.id, null);
      return "activated";
    },
    remove(game, e) {
      deactivateEntity(game, e.id);
    },
    display(game, e) {
      return `gain ${e.id} permanently`;
    }
  },

  deactivate: {
    create: (id) => ({
      type: "deactivate",
      id,
    }),
    apply(game, e) {
      deactivateEntity(game, e.id);
    },
    remove(game, e) {
      activateEntity(game, e.id, null);
    },
    display(game, e) {
      return `remove ${e.id}`;
    }
  },

  applyDuration: {
    create: (id, amount) => ({
      type: "applyDuration",
      id,
      amount,
    }),
    apply(game, e) {
      const active = game.registry.get(e.id, "ActiveHolder");

      activateEntity(game, e.id, 0);

      const expired = active.changeDuration(e.amount);

      if (expired) {
        deactivateEntity(game, e.id);
        return "conditionRemoved"
      }

      return "applied";
    },
    remove(game, e) {
      const active = game.registry.get(e.id, "ActiveHolder");
      if (!active.active) return;

      const expired = active.changeDuration(-e.amount);

      if (expired) {
        deactivateEntity(game, e.id);
        return "conditionRemoved"
      }
    },
    display(game, e) {
      return `gain ${e.id} for ${e.amount} turns`;
    }
  },

  changeDuration: {
    create: (id, amount) => ({
      type: "changeDuration",
      id,
      amount,
    }),
    apply(game, e) {
      const active = game.registry.get(e.id, "ActiveHolder");
      if (!active.isTimed) return;

      const expired = active.changeDuration(e.amount);

      if (expired) {
        deactivateEntity(game, e.id);
        return "conditionRemoved"
      }

    },
    display(game, e) {
      return `change the duration of ${e.id} by ${e.amount}`;
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
      const strength = game.registry.get(e.condition, "StatLayer");
      if (!strength) return null;

      strength.change(e);

      const effects = game.registry.get(e.condition, "PassiveHolder");
      if (effects) { effects.reapply(game, strength.value);}

      return "conditionStrengthChanged";
    },
    remove(game, e) {
      const strength = game.registry.get(e.condition, "StatLayer");
      if (!strength) return;

      strength.changeReverse(e);
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

  reapplyCondition: {
    create: (condition) => ({
      type: "reapplyCondition",
      condition
    }),
    apply(game, e) {
      const active = game.registry.get(e.condition, "ActiveHolder").active;
      if (!active) return;
      const effects = game.registry.get(e.condition, "PassiveHolder");
      if (!effects) return;
      const strength = game.registry.get(e.condition, "StatLayer") || 1;
      effects.reapply(game, strength.value);
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

  // ── Action ────────────────────────────────────────────────────────────────

  actionProgress: {
    create: (amount) => ({ type: "actionProgress", amount }),
    apply(game, e) {
      const action = getActiveAction(game);
      if (!action) return;

      game.registry
        .get(action, "CompletionHolder")
        .advanceProgress(game, e.amount);
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
      e.tags = tags; // Modify the effect (not ideal)
      return "locationChanges";
    },
    display(game, e) {
      return `move to ${e.location}`;
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

  // TODO
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