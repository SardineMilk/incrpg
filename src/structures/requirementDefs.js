import { LOCATIONS } from "../data/locationsData.js";

/*
 * Each entry defines one requirement type:
 *
 *   create(...args) -> requirement plain-object  (becomes req.X in structure.js)
 *   check(game, requirement) -> boolean
 *
 * Multiple requirements AND together;
 * Requirements in a nested array OR together:
 *   [A, B, C]              -> A && B && C
 *   [[A, B], [C, D]]       -> (A || B) && (C || D)
 */

function resolve(game, val) {
  return typeof val === "function" ? val(game) : val;
}

export const REQUIREMENT_DEFS = {
  item: {
    create: (item) => ({ type: "item", item }),
    check: (game, r) => (game.inventory[r.item] ?? 0) > 0,
  },

  locationHasTag: {
    create: (tag) => ({ type: "locationHasTag", tag }),
    check: (game, r) => LOCATIONS[game.location]?.tags.includes(r.tag) ?? false,
  },

  skillMoreThan: {
    create: (skill, value) => ({ type: "skillMoreThan", skill, value }),
    check: (game, r) => game.skills[r.skill].level >= resolve(game, r.value),
  },

  skillBaseMoreThan: {
    create: (skill, value) => ({ type: "skillBaseMoreThan", skill, value }),
    check: (game, r) => game.skills[r.skill].base >= resolve(game, r.value),
  },

  resourceUnderMaxBy: {
    create: (resource, value) => ({
      type: "resourceUnderMaxBy",
      resource,
      value,
    }),
    check(game, r) {
      const res = game.resources[r.resource];
      return res.current < res.max - resolve(game, r.value);
    },
  },

  resourceLessThan: {
    create: (resource, value) => ({
      type: "resourceLessThan",
      resource,
      value,
    }),
    check: (game, r) =>
      game.resources[r.resource].current < resolve(game, r.value),
  },

  hasCondition: {
    create: (condition, min_duration = null) => ({
      type: "hasCondition",
      condition,
      min_duration,
    }),
    check(game, r) {
      if (!(r.condition in game.activeConditions)) return false;
      if (r.min_duration == null) return true;
      return (
        resolve(game, r.min_duration) <=
        game.activeConditions[r.condition].duration
      );
    },
  },

  hasNotCondition: {
    create: (condition) => ({ type: "hasNotCondition", condition }),
    check: (game, r) => !(r.condition in game.activeConditions),
  },

  flagSet: {
    create: (flag) => ({ type: "flagSet", flag }),
    check: (game, r) => !!game.flags[resolve(game, r.flag)],
  },

  lessThan: {
    create: (x, y) => ({ type: "lessThan", x, y}),
    check: (game, r) => resolve(game, r.x) < resolve(game, r.y),
  },
  moreThan: {
    create: (x, y) => ({ type: "moreThan", x, y}),
    check: (game, r) => resolve(game, r.x) > resolve(game, r.y),
  },
};

export const req = Object.fromEntries(
  Object.entries(REQUIREMENT_DEFS).map(([key, def]) => [key, def.create]),
);
