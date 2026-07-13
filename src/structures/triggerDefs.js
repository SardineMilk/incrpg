/*
 * Each entry defines one trigger type:
 *
 *   create(...args) -> trigger plain-object  (becomes evt.X in structure.js)
 *   check(trigger, context) -> boolean
 *
 * Triggers are placed on conditions. When an effect fires, its type is compared
 * against the trigger types of every active condition; matching conditions have
 * their effects applied. The context object is whatever the effect passes along
 * (usually the resolved effect itself, occasionally with extra fields added).
 */

export const TRIGGER_DEFS = {
  
  changeValue: {
    create: (value) => ({ type: "changeValue", value }),
    check: (trigger, ctx) => trigger.value === ctx.value,
  },

  activateAction: {
    create: () => ({ type: "activateAction" }),
    check: () => true,
  },

  activateCondition: {
    create: () => ({ type: "activateCondition" }),
    check: () => true,
  },

  ctx: {
    create: (type) => ({ type: "ctx", type }),
    check: (trigger, ctx) => trigger.type === ctx.type,
  },

  tick: {
    create: () => ({ type: "tick" }),
    check: () => true,
  },

  actionChanges: {
    create: () => ({ type: "actionChanges" }),
    check: () => true, // TODO specific action or group by tag, like LocationChanges
  },

  onApply: {
    create: () => ({ type: "onApply" }),
    check: () => true,
  },

  onRemove: {
    create: () => ({ type: "onRemove" }),
    check: () => true,
  },

  valueGain: {
    create: (value, min = 1) => ({ type: "valueGain", value, min }),
    check: (trigger, ctx) =>
      ctx.value === trigger.value && ctx.amount >= trigger.min,
  },

  valueLoss: {
    create: (value, min = 1) => ({ type: "valueLoss", value, min }),
    check: (trigger, ctx) =>
      ctx.value === trigger.value && ctx.amount <= -trigger.min,
  },

  resourceDropsBelowThreshold: {
    create: (resource, threshold) => ({
      type: "resourceDropsBelowThreshold",
      resource,
      threshold,
    }),
    check: (trigger, ctx) =>
      ctx.resource === trigger.resource && ctx.current < trigger.threshold,
  },

  gainSkillXp: {
    // skill is optional - none fires on any skill gaining xp
    create: (skill) => ({ type: "gainSkillXp", skill }),
    check: (trigger, ctx) => {
      if (!ctx.skill) return false;
      const skillMatches = trigger.skill == null || ctx.skill === trigger.skill
      return skillMatches && ctx.amount >= 0;
    },
  },

  conditionApplied: {
    create: (condition) => ({ type: "conditionApplied", condition }),
    check: (trigger, ctx) => ctx.condition === trigger.condition,
  },

  locationChanges: {
    // tags is optional - none fires on any location change
    create: (tags = []) => ({ type: "locationChanges", tags }),
    check: (trigger, ctx) =>
      trigger.tags.length === 0 ||
      trigger.tags.every((tag) => ctx.tags?.includes(tag)),
  },
};

export const evt = Object.fromEntries(
  Object.entries(TRIGGER_DEFS).map(([key, def]) => [key, def.create]),
);
