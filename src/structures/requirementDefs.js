import { tagsOf } from "../utils/tagIndex.js";

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

  hasTag: {
    create: (id, tag) => ({ type: "hasTag", id, tag }),
    check: (game, r) => tagsOf(r.id).includes(r.tag),
  },

  skillMoreThan: {
    create: (skill, value) => ({ type: "skillMoreThan", skill, value }),
    check: (game, r) => game.registry.get(r.skill, "LevelHolder").level >= r.value
  },

  skillBaseMoreThan: {
    create: (skill, value) => ({ type: "skillBaseMoreThan", skill, value }),
    check: (game, r) => game.registry.get(r.skill, "LevelHolder").baseLevel >= r.value
  },

  valueLessThan: {
    create: (value, amount) => ({
      type: "valueLessThan",
      value,
      amount,
    }),
    check: (game, r) => {
      return game.values[r.value] < r.amount;
    },
  },

  active: {
    create: (id) => ({ type: "active", id }),
    check: (game, r) => {
      console.log(r)
      return game.registry.get(r.id, "ActiveHolder").active;
    }
  },

  inactive: {
    create: (id) => ({ type: "inactive", id }),
    check: (game, r) => !game.registry.get(r.id, "ActiveHolder").active,
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
  geq: {
    create: (x, y) => ({ type: "geq", x, y}),
    check: (game, r) => r.x >= r.y,
  },
  leq: {
    create: (x, y) => ({ type: "leq", x, y}),
    check: (game, r) => r.x <= r.y,
  },


  /* 
  * Custom Requirements 
  * Not required for API, but handy for repeated code patterns
  * Be careful with these, they're an escape hatch not a normal feature
  */
  skillsImbalanced: {
    create: (a, b) => ({ type: "skillsImbalanced", a, b}),
    check: (game, r) => ((game.skills[r.a].level/2) > game.skills[r.a].level)&&((game.skills[r.a].level - game.skills[r.a].level) > 10)
  }
};

export const req = Object.fromEntries(
  Object.entries(REQUIREMENT_DEFS).map(([key, def]) => [key, def.create]),
);
