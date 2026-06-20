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
    check: (game, r) => game.skills[r.skill].level >= r.value,
  },

  skillBaseMoreThan: {
    create: (skill, value) => ({ type: "skillBaseMoreThan", skill, value }),
    check: (game, r) => game.skills[r.skill].base >= r.value,
  },

  valueLessThan: {
    create: (value, amount) => ({
      type: "valueLessThan",
      value,
      amount,
    }),
    check: (game, r) => {
      console.log(r.value, game.values[r.value], r.amount);
      return game.values[r.value] < r.amount;
    },
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
        r.min_duration <=
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
    check: (game, r) => !!game.flags[r.flag],
  },

  lessThan: {
    create: (x, y) => ({ type: "lessThan", x, y}),
    check: (game, r) => r.x < r.y,
  },
  moreThan: {
    create: (x, y) => ({ type: "moreThan", x, y}),
    check: (game, r) => r.x > r.y,
  },
  eq: {
    create: (x, y) => ({ type: "eq", x, y}),
    check: (game, r) => r.x == r.y,
  }, 
  neq: {
    create: (x, y) => ({ type: "neq", x, y}),
    check: (game, r) => r.x != r.y,
  }, 
};

export const req = Object.fromEntries(
  Object.entries(REQUIREMENT_DEFS).map(([key, def]) => [key, def.create]),
);
