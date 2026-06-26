import { LogType } from "../game/log.js";
import { LOCATIONS } from "../data/locationsData.js";

/*
 * Each entry defines one effect type:
 *
 *   create(...args) -> effect plain-object  (becomes eff.X in structure.js)
 *   apply(game, resolvedEffect, ctx) -> triggerDescriptor | null
 *   scale?(game, effect, multiplier) -> scaled copy of effect
 *
 * triggerDescriptor:
 *   - a string          -> fire that trigger type, using the effect as context
 *   - { type, context } -> fire with a custom context object
 *   - null / undefined  -> no trigger
 *
 * ctx is injected by effects.js to break circular init-time deps:
 *   { grantSkillXp, CONDITIONS }
 * Effects that don't need external deps can ignore it.
 * 
 * Most effects have their outcomes reset each tick
 * E.g. skillXpMultiplier for each skill starts at 1 each tick, and is built from active condition effects
 * Some effects are PERSISTENT. These have a lasting effect on the state. It should be fairly obvious which is which 
 */

// TODO - actually work out what should be scaled
function scaleAmount(game, effect, mul) {
  const prev = effect.amount;
  return {
    ...effect,
    amount: (g) => (typeof prev === "function" ? prev(g) : prev) * mul,
  };
}

// TODO fix this so it makes intuitive sense
// 3 scalars maybe?
// Multiplier is default 1, maybe calculate it at an offset
function scaleStatLayer(game, effect, mul) {
  const prevFlat        = effect.flat;
  const prevPercent     = effect.percent;
  const prevMultiplier  = effect.multiplier;

  return {
    ...effect,
    flat: (g) => (typeof prevFlat === "function" ? prevFlat(g) : prevFlat) * mul,
    //percent: (g) => (typeof prevPercent === "function" ? prevPercent(g) : prevPercent) * mul,
    //multiplier: (g) => (typeof prevMultiplier === "function" ? prevMultiplier(g) : prevMultiplier) * mul,
  };
}

export const EFFECT_DEFS = {
  // ── Skills ────────────────────────────────────────────────────────────────

  // PERSISTENT
  grantSkillXp: {
    create: (skill, amount) => ({ type: "grantSkillXp", skill, amount }),
    apply(game, e) {
      if (e.skill == null) return null;
      const xpForSkill = e.amount * game.skills[e.skill].xpMultiplier;
      game.skills[e.skill].xp += xpForSkill;
      return "gainSkillXp";
    },
    scale: scaleAmount,
  },

  skillXpMultiplier: {
    create: (skill, amount) => ({ type: "skillXpMultiplier", skill, amount }),
    apply(game, e) {
      if (e.skill == null) return null;
      game.skills[e.skill].xpMultiplier *= e.amount;
    },
    scale: scaleAmount,
  },

  skillLevelBonus: {
    create: (skill, { flat = 0, multiplier = 1 } = {}) => ({
      type: "skillLevelBonus",
      skill,
      flat,
      multiplier,
    }),
    apply(game, e) {
      if (e.skill == null) return null;
      const s = game.skills[e.skill]; 
      s.bonus.flat += e.flat;
      s.bonus.multiplier *= e.multiplier;
      s.level = (s.base + s.bonus.flat) * s.bonus.multiplier;
    },
  },

  // ── Conditions ────────────────────────────────────────────────────────────

  // PERSISTENT
  applyCondition: {
    create: (condition, amount = null) => ({
      type: "applyCondition",
      condition,
      amount,
    }),
    apply(game, e) {
      const state = game.conditionStates[e.condition];
      //if (state.active && (e.amount == null)) return;
      if (!state.active) state.new = true;  // If new, whileActive effects are applied

      state.active = true;
      if (e.amount == null) state.duration = null;
      else state.duration += e.amount;
        
      return "conditionApplied";
    },
  },

  changeConditionStrength: {
    create: ( condition, { flat = 0, percent = 0, multiplier = 1 } = {}) => ({
      type: "changeConditionStrength",
      condition,
      flat,
      percent,
      multiplier,
    }),

    apply(game, e) {
      const c = game.conditionStates[e.condition];

      c.strength.flat += e.flat;
      c.strength.percent += e.percent;
      c.strength.multiplier *= e.multiplier;

      return "conditionStrengthChanged"
    },

    scale: scaleStatLayer,
  },

  // ── Values ─────────────────────────────────────────────────────────────

  // PERSISTENT
  changeValue: {
    create: (value, amount) => ({
      type: "changeValue",
      value,
      amount,
    }),
    apply(game, e) {
      game.values[e.value] = game.values[e.value] || 0;
      game.values[e.value] += e.amount;

      if (e.amount > 0) return "valueGain";
      if (e.amount < 0) return "valueLoss";
      return null;
    },
    scale: scaleAmount,
  },

  setValue: {
    create: (value, amount) => ({ 
      type: "setValue", 
      value, 
      amount ,
    }),
    apply(game, e) {
      game.values[e.value] = e.amount;
    },
  },


  // Used to clean up state
  removeValue: {
    create: (value) => ({ 
      type: "removeValue", 
      value, 
    }),
    apply(game, e) {
      // TODO undefined value behaviour
      delete game.values[e.value];
    },
  },

  // ── Attribute ─────────────────────────────────────────────────────────────
  changeAttribute: {
    create: (attribute, { flat = 0, percent = 0, multiplier = 1 } = {}) => ({
      type: "changeAttribute",
      attribute,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      game.attributes[e.attribute] = game.attributes[e.attribute] || {flat:0, percent:1, multiplier:1};
      const s = game.attributes[e.attribute];
      s.flat += e.flat || 0;
      s.percent += e.percent || 0;
      s.multiplier *= e.multiplier || 1;
      s.value = s.flat * s.percent * s.multiplier;
    },
    scale: scaleStatLayer, 
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
      game.attributes[e.attribute] = {flat:e.flat, percent:e.percent, multiplier:e.multiplier};
      game.attributes[e.attribute].value = e.flat * e.percent * e.multiplier;
    },
    scale: scaleStatLayer, 
  },

  // Used to clean up state
  removeAttribute: {
    create: (attribute) => ({ 
      type: "removeAttribute", 
      attribute, 
    }),
    apply(game, e) {
      // TODO undefined attribute behaviour
      delete game.attributes[e.attribute];
    },
  },

  // ── Activity ──────────────────────────────────────────────────────────────
  activityProgress: {
    create: (amount) => ({
      type: "activityProgress",
      amount,
    }),
    apply(game, e) {
      game.values.activityProgress += e.amount;
      return null;
    },
    scale: scaleAmount,
  },


  // ── World ─────────────────────────────────────────────────────────────────

  setLocation: {
    create: (location) => ({ type: "setLocation", location }),
    apply(game, e) {
      game.location = e.location;
      const tags = LOCATIONS[e.location]?.tags ?? [];
      // Trigger needs the location's tags, not just the effect fields
      // TODO refactor this to be trigger's problem
      return { type: "locationChanges", context: { ...e, tags } };
    },
  },

  setActiveAction: {
    create: (action) => ({ type: "setActiveAction", action }),
    apply(game, e) {
      game.activeAction = e.action;
      return "actionChanges";
    },
  },

  // ── UI / Log ──────────────────────────────────────────────────────────────

  sendMessage: {
    create: (category, message) => ({ type: "sendMessage", category, message }),
    apply(game, e) {
      game.log.append(LogType.ACTION, e.message);
    },
  },

  presentChoice: {
    create: (options) => ({ type: "presentChoice", options }),
    apply(game, e) {
      // TODO hook into UI properly
      game.log.append(LogType.ACTION, e.options);
    },
  },

  // ── Misc ──────────────────────────────────────────────────────────────────

  setFlag: {
    create: (flag, value) => ({ type: "setFlag", flag, value }),
    apply(game, e) {
      game.flags[e.flag] = e.value;
    },
  },

  tick: {
    create: () => ({ type: "tick" }),
    apply(game) {
      game.tick++;
      return "tick";
    },
  },

  forceTrigger: {
    create: (trigger) => ({ type: "forceTrigger", trigger }),
    apply(game, e) {
      return e.trigger;
    },
  },

  log: {
    create: (str) => ({ type: "log", str }),
    apply(game, e) {
      console.log(e.str);
    },
  },
};

export const eff = Object.fromEntries(
  Object.entries(EFFECT_DEFS).map(([key, def]) => [key, def.create]),
);
