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
    remove(game, e) {
      if (e.skill == null) return;
      game.skills[e.skill].xpMultiplier /= e.amount;
    },
    scale: scaleAmount,
  },

  skillLevelBonus: {
    create: (skill, {flat = 0, percent = 0, multiplier = 1 } = {}) => ({
      type: "skillLevelBonus",
      skill,
      flat,
      multiplier,
    }),
    apply(game, e) {
      if (e.skill == null) return null;
      const s = game.skills[e.skill];
      s.bonus.flat       += e.flat;
      s.bonus.percent    += e.percent;
      s.bonus.multiplier *= e.multiplier;
      s.level = (s.base + s.bonus.flat) * s.bonus.percent * s.bonus.multiplier;
    },
    remove(game, e) {
      if (e.skill == null) return;
      const s = game.skills[e.skill];
      s.bonus.flat       -= e.flat;
      s.bonus.percent    -= e.percent;
      s.bonus.multiplier /= e.multiplier;
      s.level = (s.base + s.bonus.flat) * s.bonus.percent * s.bonus.multiplier;
    },
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
      c.strength.flat       += e.flat;
      c.strength.percent    += e.percent;
      c.strength.multiplier *= e.multiplier;

      // If the condition is active, its passive effects must be reapplied
      if (c.active) c.needsReapply = true;

      return "conditionStrengthChanged";
    },
    remove(game, e) {
      const c = game.conditionStates[e.condition];
      if (!c) return;
      c.strength.flat       -= e.flat;
      c.strength.percent    -= e.percent;
      c.strength.multiplier /= e.multiplier;
    },
    scale: scaleStatLayer,
  },

  // ── Values ────────────────────────────────────────────────────────────────

  // Reversible — subtracts the same amount on remove
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
  },

  // fire-and-forget setters — no remove (would need prior-value snapshot)
  setValue: {
    create: (value, amount) => ({ type: "setValue", value, amount }),
    apply(game, e) {
      game.values[e.value] = e.amount;
    },
  },

  removeValue: {
    create: (value) => ({ type: "removeValue", value }),
    apply(game, e) {
      delete game.values[e.value];
    },
  },

  // ── Attributes ────────────────────────────────────────────────────────────

  // Reversible — flat/percent subtract back, multiplier divides back
  changeAttribute: {
    create: (attribute, { flat = 0, percent = 0, multiplier = 1 } = {}) => ({
      type: "changeAttribute",
      attribute,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      game.attributes[e.attribute] = game.attributes[e.attribute] || { flat: 0, percent: 1, multiplier: 1 };
      const s = game.attributes[e.attribute];
      s.flat       += e.flat       || 0;
      s.percent    += e.percent    || 0;
      s.multiplier *= e.multiplier || 1;
      s.value = s.flat * s.percent * s.multiplier;
    },
    remove(game, e) {
      const s = game.attributes[e.attribute];
      if (!s) return;
      s.flat       -= e.flat       || 0;
      s.percent    -= e.percent    || 0;
      s.multiplier /= e.multiplier || 1;
      s.value = s.flat * s.percent * s.multiplier;
    },
    scale: scaleStatLayer,
  },

  // fire-and-forget setter
  setAttribute: {
    create: (attribute, { flat = 0, percent = 0, multiplier = 1 } = {}) => ({
      type: "setAttribute",
      attribute,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      game.attributes[e.attribute] = { flat: e.flat, percent: e.percent, multiplier: e.multiplier };
      game.attributes[e.attribute].value = e.flat * e.percent * e.multiplier;
    },
    scale: scaleStatLayer,
  },

  removeAttribute: {
    create: (attribute) => ({ type: "removeAttribute", attribute }),
    apply(game, e) {
      delete game.attributes[e.attribute];
    },
  },

  // ── Activity ──────────────────────────────────────────────────────────────

  activityProgress: {
    create: (amount) => ({ type: "activityProgress", amount }),
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