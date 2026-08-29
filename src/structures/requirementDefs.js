import { tagsOf } from "../utils/tagIndex.js";

export const REQUIREMENT_DEFS = {
  hasTag: {
    create: (id, tag) => ({ type: "hasTag", id, tag }),
    check: (game, r) => tagsOf(r.id).includes(r.tag),
  },

  active: {
    create: (id) => ({ type: "active", id }),
    check: (game, r) => {
      game.reactor.read(`active:${game.id}:${r.id}`);
      return game.active.isActive(r.id);
    },
  },
  inactive: {
    create: (id) => ({ type: "inactive", id }),
    check: (game, r) => {
      game.reactor.read(`active:${game.id}:${r.id}`);
      return !game.active.isActive(r.id);
    },
  },
  valueLessThan: {
    create: (value, amount) => ({ type: "valueLessThan", value, amount }),
    check: (game, r) => {
      game.reactor.read(`value:${game.id}:${r.value}`);
      return game.values[r.value] < r.amount;
    },
  },
  skillMoreThan: {
    create: (skill, value) => ({ type: "skillMoreThan", skill, value }),
    check: (game, r) => {
      game.reactor.read(`level:${game.id}:${r.skill}`);
      return game.registry.get(r.skill, "LevelHolder").level >= r.value;
    }
  },
  skillBaseMoreThan: {
    create: (skill, value) => ({ type: "skillBaseMoreThan", skill, value }),
    check: (game, r) => {
      game.reactor.read(`level:${game.id}:${r.skill}`);
      return game.registry.get(r.skill, "LevelHolder").baseLevel >= r.value;
    }
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


  skillsImbalanced: {
    create: (a, b) => ({ type: "skillsImbalanced", a, b }),
    check: (game, r) => {
      game.reactor.read(`level:${game.id}:${r.a}`);
      game.reactor.read(`level:${game.id}:${r.b}`);
      const A = game.registry.get(r.a, "LevelHolder").level;
      const B = game.registry.get(r.b, "LevelHolder").level;
      return (A / 2 > B) && (A - B > 10);
    }
  },
};

export const req = Object.fromEntries(
  Object.entries(REQUIREMENT_DEFS).map(([key, def]) => [key, def.create]),
);