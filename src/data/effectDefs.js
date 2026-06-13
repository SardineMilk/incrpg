import { LogType } from "../game/log.js";
import { LOCATIONS } from "./locationsData.js";

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

function scaleAmount(game, effect, mul) {
  const prev = effect.amount;
  return {
    ...effect,
    amount: (g) => (typeof prev === "function" ? prev(g) : prev) * mul,
  };
}

export const EFFECT_DEFS = {
  // ── Skills ────────────────────────────────────────────────────────────────

  // PERSISTENT
  grantSkillXp: {
    create: (skill, amount) => ({ type: "grantSkillXp", skill, amount }),
    apply(game, e, { grantSkillXp }) {
      if (e.skill == null) return null;
      grantSkillXp(game, e.skill, e.amount);
      return "gainSkillXp";
    },
    scale: scaleAmount,
  },

  skillXpMultiplier: {
    create: (skill, amount) => ({ type: "skillXpMultiplier", skill, amount }),
    apply(game, e) {
      if (e.skill == null) return null;
      game.skills[e.skill].multiplier += e.amount;
    },
    scale: scaleAmount,
  },

  skillLevelBonus: {
    create: (skill, flat = 0, multiplier = 0) => ({
      type: "skillLevelBonus",
      skill,
      flat,
      multiplier,
    }),
    apply(game, e) {
      if (e.skill == null) return null;
      game.skills[e.skill].bonus.flat += e.flat;
      game.skills[e.skill].bonus.multiplier += e.multiplier;
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
      game.activeConditions[e.condition] ??= { strength: 1 };
      if (e.amount == null || e.condition == null) return null;
      const cond = game.activeConditions[e.condition];
      cond.duration = (cond.duration ?? 0) + e.amount;
      return "conditionApplied";
    },
  },

  changeConditionStrength: {
    create: (condition, amount) => ({
      type: "changeConditionStrength",
      condition,
      amount,
    }),
    apply(game, e) {
      if (!game.activeConditions[e.condition]) return null;
      game.activeConditions[e.condition].strength += e.amount;
    },
    scale: scaleAmount,
  },

  // CONDITIONS injected via ctx — importing conditionsData.js here would
  // create a circular init-time dep (conditionsData → structure → effectDefs → conditionsData).
  changeConditionTagStrength: {
    create: (tag, amount) => ({
      type: "changeConditionTagStrength",
      tag,
      amount,
    }),
    apply(game, e, { CONDITIONS }) {
      for (const id in game.activeConditions) {
        if (CONDITIONS[id]?.tags?.includes(e.tag))
          game.activeConditions[id].strength += e.amount;
      }
    },
  },

  // ── Resources ─────────────────────────────────────────────────────────────

  // PERSISTENT
  changeResource: {
    create: (resource, amount) => ({
      type: "changeResource",
      resource,
      amount,
    }),
    apply(game, e) {
      game.resources[e.resource].current += e.amount;
      if (e.amount > 0) return "resourceGain";
      if (e.amount < 0) return "resourceLoss";
      return null;
    },
    scale: scaleAmount,
  },

  setResource: {
    create: (resource, amount) => ({ type: "setResource", resource, amount }),
    apply(game, e) {
      game.resources[e.resource].current = e.amount;
    },
  },
  
  changeResourceMax: {
    create: (resource, amount) => ({
      type: "changeResourceMax",
      resource,
      amount,
    }),
    apply(game, e) {
      game.resources[e.resource].max += e.amount;
      return null;
    },
    scale: scaleAmount,
  },

  // ── Activity ──────────────────────────────────────────────────────────────
  activityProgress: {
    create: (amount) => ({
      type: "activityProgress",
      amount,
    }),
    apply(game, e) {
      game.flags.activityProgress += e.amount;
      return null;
    },
    scale: scaleAmount,
  },

  // ── Action ────────────────────────────────────────────────────────────────

  changeCheckDifficulty: {
    create: (tag=null, flat, multiplier=0) => ({
      type: "changeCheckDifficulty",
      tag,
      flat,
      multiplier,
    }),
    apply(game, e) {
      game.flags.checkDifficulty.flat += e.flat;
      game.flags.checkDifficulty.multiplier += e.multiplier;
      game.flags.checkDifficulty.value = game.flags.checkDifficulty.flat * game.flags.checkDifficulty.multiplier 
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
};

export const eff = Object.fromEntries(
  Object.entries(EFFECT_DEFS).map(([key, def]) => [key, def.create]),
);
