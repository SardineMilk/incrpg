import { LogType } from "../game/log.js";
import { LOCATIONS } from "../data/locationsData.js";
import { processTrigger } from "../game/events.js";
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
  if (game.active.isActive(entity)) return;
  const effects = game.registry.get(entity, "PassiveHolder");
  if (effects) effects.apply(game, getStrength(game, entity));
  if (duration != null) {
    game.registry.get(entity, "CompletionHolder")?.resetMeter("duration", duration);
  }
  game.active.activate(entity);
  processTrigger(game, "onActivate", { id: entity });
}

function deactivateEntity(game, entity) {
  if (!game.active.isActive(entity)) return;
  const effects = game.registry.get(entity, "PassiveHolder");
  if (effects) effects.remove(game, getStrength(game, entity));
  game.registry.get(entity, "CompletionHolder")?.clearMeter("duration");
  game.active.deactivate(entity);
  processTrigger(game, "onDeactivate", { id: entity });
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

  cancelEffect: {
    create: () => ({ type: "cancelEffect" }),
    apply(game, e) {
      e.cancelled = true;
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
        ?.gainXp(game, e.amount);

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


  // ── CompletionHolder ────────────────────────────────────────────────────────────

  activate: {
    create: (id, duration = null) => ({ type: "activate", id, duration }),
    apply(game, e) {
      activateEntity(game, e.id, e.duration);
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

  progress: {
    create: (id, amount, meter = "progress") => ({ type: "progress", id, amount, meter }),
    apply(game, e) {
      const holder = game.registry.get(e.id, "CompletionHolder");
      if (!holder) return;
      holder.advanceProgress(game, e.amount, e.meter);
    },
    scale: scaleAmount,
    display(game, e) {
      return `add ${e.amount} progress to ${e.id} (${e.meter})`;
    }
  },

  changeDuration: {
    create: (id, amount) => ({ type: "changeDuration", id, amount }),
    apply(game, e) {
      const outcome = game.registry.get(e.id, "CompletionHolder")
        ?.advanceProgress(game, e.amount, "duration");
      if (outcome === "meterMin") return "durationExpired";
    },
    display(game, e) {
      return `change the duration of ${e.id} by ${e.amount}`;
    }
  },


  setMeter: {
    create: (id, amount, meter) => ({ type: "setMeter", id, amount, meter }),
    apply(game, e) {
      const holder = game.registry.get(e.id, "CompletionHolder");
      if (!holder) return;
      holder.setProgress(game, e.amount, e.meter);
    },
    scale: scaleAmount,
    display(game, e) {
      return `add ${e.amount} progress to ${e.id} (${e.meter})`;
    }
  },

  // ── StrengthHolder ────────────────────────────────────────────────────────────

  changeStrength: {
    create: (id, { flat = 0, percent = 0, multiplier = 1 } = {}) => ({
      type: "changeStrength",
      id,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      const strength = game.registry.get(e.id, "StatLayer");
      if (!strength) return;

      strength.change(e);
      // TODO - this should be automatic
      const effects = game.registry.get(e.id, "PassiveHolder");
      if (effects) { effects.reapply(game, strength.value);}

      return "strengthChanged";
    },
    remove(game, e) {
      const strength = game.registry.get(e.id, "StatLayer");
      if (!strength) return;

      strength.changeReverse(e);
    },
    scale: scaleStatLayer,
    display(game, e) {
      let m = `modify ${e.id} strength by: `;
      if (e.flat != 0) m += `+${e.flat} `;
      if (e.percent != 0) m += `${e.percent}% `;
      if (e.multiplier != 1) m += `x${e.multiplier} `;
      return m;
    }
  },

  setStrength: {
    create: (id, { flat = 1, percent = 1, multiplier = 1 } = {}) => ({
      type: "setStrength",
      id,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      const strength = game.registry.get(e.id, "StatLayer");
      if (!strength) return;
      
      strength.set(e);
      // TODO - this should be automatic
      const effects = game.registry.get(e.id, "PassiveHolder");
      if (effects) { effects.reapply(game, strength.value);}

      return "strengthChanged";
    },
    scale: scaleStatLayer,
    display(game, e) {
      let m = `set ${e.id} strength to: `;
      m += `${e.flat} flat, `;
      m += `${e.percent}%, `;
      m += `x${e.multiplier} `;
      return m;
    }
  },


  // ── Values ────────────────────────────────────────────────────────────────

  changeValue: {
    create: (id, amount) => ({ type: "changeValue", id, amount }),
    apply(game, e) {
      game.values[e.id] = game.values[e.id] || 0;
      game.values[e.id] += e.amount;
      if (e.amount > 0) return "valueGain";
      if (e.amount < 0) return "valueLoss";
      return null;
    },
    remove(game, e) {
      game.values[e.id] -= e.amount;
    },
    scale: scaleAmount,
    display(game, e) {
      return `${e.amount > 0 ? 'gain' : 'lose'} ${Math.abs(e.amount)} ${e.id}`;
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

  // TODO - this is stupid
  reapplyCondition: {
    create: (condition) => ({
      type: "reapplyCondition",
      condition
    }),
    apply(game, e) {
      if (!game.active.isActive(e.condition)) return;
      const effects = game.registry.get(e.condition, "PassiveHolder");
      if (!effects) return;
      const strength = game.registry.get(e.condition, "StatLayer") || 1;
      effects.reapply(game, strength.value);
    }
  },

  skillCheck: {
    create: (skills, difficulty, success, failure) => ({ type: "skillCheck", skills, difficulty, success, failure }),
    resolve(game, c) {
      const power = Object.entries(c.skills).reduce(
        (sum, [skill, weight]) =>
          sum + (game.registry.get(skill, "LevelHolder")?.level ?? 0) * weight,
        0
      );
      // Placeholder balancing: skill power vs a difficulty-scaled roll.
      const roll = Math.random() * c.difficulty * 2;
      const successful =  power + roll >= c.difficulty;

      // Needs some way to apply without calling applyEffect()
      // Due to circular dependency stuff
      // Also needs strength to be applied properly
      // Should work for nested checks too
      if (successful) {

      } else {

      }

    },
  },

};

export const eff = Object.fromEntries(
  Object.entries(EFFECT_DEFS).map(([key, def]) => [key, def.create]),
);