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
    create: (skill, flat = 0, percent=0, multiplier = 0) => ({
      type: "skillLevelBonus",
      skill,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      if (e.skill == null) return null;
      const s = game.skills[e.skill]; 
      s.bonus.flat += e.flat;
      s.bonus.percent += e.percent;
      s.bonus.multiplier *= e.multiplier;
      s.level = (s.base + s.bonus.flat) * s.bonus.percent * s.bonus.multiplier;
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
    create: (condition, flat, percent, multiplier) => ({
      type: "changeConditionStrength",
      condition,
      flat,
      percent,
      multiplier
    }),
    apply(game, e) {
      if (!game.activeConditions[e.condition]) return null;
      const c = game.activeConditions[e.condition];
      c.bonus.flat += e.flat;
      c.bonus.percent += e.percent;
      c.bonus.multiplier *= e.multiplier;
      c.strength = c.bonus.flat * c.bonus.percent * c.bonus.multiplier;
    },
    scale: scaleAmount,
  },

  // ── Stats ─────────────────────────────────────────────────────────────

  // PERSISTENT
  changeStat: {
    create: (stat, amount) => ({
      type: "changeStat",
      stat,
      amount,
    }),
    apply(game, e) {
      game.stats[e.stat] = game.stats[e.stat] || 0;
      game.stats[e.stat] += e.amount;
      if (e.amount > 0) return "statGain";
      if (e.amount < 0) return "statLoss";
      return null;
    },
    scale: scaleAmount,
  },

  setStat: {
    create: (stat, amount) => ({ 
      type: "setStat", 
      stat, 
      amount ,
    }),
    apply(game, e) {
      game.stats[e.stat] = e.amount;
    },
  },


  // Used to clean up state
  removeStat: {
    create: (stat) => ({ 
      type: "removeStat", 
      stat, 
    }),
    apply(game, e) {
      // TODO undefined stat behaviour
      delete game.stats[e.stat];
    },
  },

  changeValue: {
    create: (value, flat, percent, multiplier) => ({
      type: "changeValue",
      value,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      game.values[e.value] = game.values[e.value] || {flat:0, percent:1, multiplier:1};
      const s = game.values[e.value];
      s.flat += e.flat;
      s.percent += e.percent;
      s.multiplier *= e.multiplier;
      s.value = s.flat * s.percent * s.multiplier;
    },
    scale: scaleAmount,  // TODO this is wrong
  },

  setValue: {
    create: (value, flat, percent, multiplier) => ({
      type: "setValue",
      value,
      flat,
      percent,
      multiplier,
    }),
    apply(game, e) {
      game.values[e.value] = {flat:e.flat, percent:e.percent, multiplier:e.multiplier};
      game.values[e.value] = s.flat * s.percent * s.multiplier;
    },
    scale: scaleAmount,  // TODO this is wrong
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
};

export const eff = Object.fromEntries(
  Object.entries(EFFECT_DEFS).map(([key, def]) => [key, def.create]),
);
