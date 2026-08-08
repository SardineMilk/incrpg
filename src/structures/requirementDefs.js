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
  // TODO - id of most recent context on stack equals

  hasTag: {
    create: (id, tag) => ({ type: "hasTag", id, tag }),
    check: (game, r) => tagsOf(r.id).includes(r.tag),
  },

  active: {
    create: (id) => ({ type: "active", id }),
    check: (game, r) => {
      game.reactor.read(`active:${r.id}`);
      return game.active.isActive(r.id);
    },
  },
  inactive: {
    create: (id) => ({ type: "inactive", id }),
    check: (game, r) => {
      game.reactor.read(`active:${r.id}`);
      return !game.active.isActive(r.id);
    },
  },
  valueLessThan: {
    create: (value, amount) => ({ type: "valueLessThan", value, amount }),
    check: (game, r) => {
      game.reactor.read(`value:${r.value}`);
      return game.values[r.value] < r.amount;
    },
  },
  skillMoreThan: {
    create: (skill, value) => ({ type: "skillMoreThan", skill, value }),
    check: (game, r) => {
      game.reactor.read(`level:${r.skill}`);
      return game.registry.get(r.skill, "LevelHolder").level >= r.value;
    }
  },
  skillBaseMoreThan: {
    create: (skill, value) => ({ type: "skillBaseMoreThan", skill, value }),
    check: (game, r) => {
      game.reactor.read(`level:${r.skill}`);
      return game.registry.get(r.skill, "LevelHolder").baseLevel >= r.value;
    }
  },


  flagSet: {
    create: (flag) => ({ type: "flagSet", flag }),
    check: (game, r) => !!game.flags[r.flag],
  },

  lt: {
    create: (x, y) => ({ type: "lt", x, y}),
    check: (game, r) => r.x < r.y,
  },
  gt: {
    create: (x, y) => ({ type: "gt", x, y}),
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
    create: (a, b) => ({ type: "skillsImbalanced", a, b }),
    check: (game, r) => {
      game.reactor.read(`level:${r.a}`);
      game.reactor.read(`level:${r.b}`);
      const A = game.registry.get(r.a, "LevelHolder").level;
      const B = game.registry.get(r.b, "LevelHolder").level;
      return (A / 2 > B) && (A - B > 10);
    }
  },
};

export const req = Object.fromEntries(
  Object.entries(REQUIREMENT_DEFS).map(([key, def]) => [key, def.create]),
);
