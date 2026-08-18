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
import { tagsOf } from "../utils/tagIndex.js";



export const TRIGGER_DEFS = {
  // TODO - replace all similar events with something like evt.apply(eff)
  activate: {
    create: (tags = []) => ({ type: "activate", tags }),
    check: (trigger, ctx) =>
      trigger.tags.length === 0 || trigger.tags.every((tag) => tagsOf(ctx.id).includes(tag)),
  },

  ctx: {
    create: (type) => ({ type: "ctx", type }),
    check: (trigger, ctx) => trigger.type === ctx.type,
  },

  tick: {
    create: () => ({ type: "tick" }),
    check: () => true,
  },

  onTrigger: {
    create: (id) => ({ type: "onTrigger", id}),
    check: (trigger, ctx) => trigger.id === ctx.id
  },


  onActivate: {
    create: () => ({ type: "onActivate" }),
    check: () => true,
  },

  onDeactivate: {
    create: () => ({ type: "onDeactivate" }),
    check: () => true,
  },

  changeValue: {
    create: (id) => ({ type: "changeValue", id }),
    check: (trigger, ctx) => ctx.id === trigger.id,
  },

  valueGain: {
    create: (id, min = 1) => ({ type: "valueGain", id, min }),
    check: (trigger, ctx) =>
      ctx.id === trigger.id && ctx.amount >= trigger.min,
  },

  valueLoss: {
    create: (id, min = 1) => ({ type: "valueLoss", id, min }),
    check: (trigger, ctx) =>
      ctx.id === trigger.id && ctx.amount <= -trigger.min,
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

  gainXp: {
    // skill is optional - none fires on any skill gaining xp
    create: (id) => ({ type: "gainXp", id }),
    check: (trigger, ctx) => {
      if (!ctx.id) return false;
      const matches = trigger.id == null || ctx.id === trigger.id
      return matches && ctx.amount >= 0;
    },
  },

  conditionApplied: {
    create: (condition) => ({ type: "conditionApplied", condition }),
    check: (trigger, ctx) => ctx.condition === trigger.condition,
  },

  locationChanges: {
    create: (tags = []) => ({ type: "locationChanges", tags }),
    check: (trigger, ctx) =>
      trigger.tags.length === 0 || trigger.tags.every((tag) => tagsOf(ctx.location).includes(tag)),
  },

  durationExpired: {
    create: (id) => ({ type: "durationExpired", id }),
    check: (trigger, ctx) => trigger.id == null || trigger.id === ctx.id,
  },

  progress: {
    create: (meter="progress") => ({ type: "progress", meter}),
    check: (trigger, ctx) => (trigger.meter == null || trigger.meter === ctx.meter),
  },

  levelUp: {
    create: (id) => ({ type: "levelUp", id }),
    check: (trigger, ctx) => ((trigger.id == null) || (ctx.id === trigger.id))
  },
};

export const evt = Object.fromEntries(
  Object.entries(TRIGGER_DEFS).map(([key, def]) => [key, def.create]),
);
