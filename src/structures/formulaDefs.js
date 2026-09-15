import { isSelector } from "./selectorDefs.js";
import { byTag, nameOf, parentOf, tagsOf } from "../utils/tagIndex.js";
import { xpToNext } from "../utils/math.js";

const res = (val, game) => (typeof val === "function" ? val(game) : val);
const lift =
  (fn) =>
  (...args) =>
  (game) =>
    fn(game, ...args.map((arg) => res(arg, game)));

// Nulls are truthy. Because I say so.
const satisfied = (b) => b == null || !!b;

// When adding a new formula it always takes `game` as a parameter,
// but you don't need to pass game at point of use.
const definitions = {
  // Get data from current effect stack, with shortcuts for the most common uses
  ctx: (game, key) => game.context.get(key),
  id: (game) => game.context.get("id"),
  amount: (game) => game.context.get("amount"),

  // Get data from current expanded selector candidate
  // Niche, but required in some cases where multiple fields use the candidate
  // eff.gainXp(sel.tags("skills"), fml.level(fml.candidate("id")))
  candidate: (game, key) => game.candidateScope.get(key),

  actor: (game, id) => game.world.actors.get(id),


  value: (game, value) => {
    game.reactor.read(`value:${game.id}:${value}`);
    return game.values[value];
  },
  duration: (game, id) => {
    game.reactor.read(`meter:${game.id}:${id}:duration`);
    return game.registry.get(id, "CompletionHolder")?.progressOf("duration");
  },
  progress: (game, id, meter) => {
    game.reactor.read(`meter:${game.id}:${id}:${meter}`);
    return game.registry.get(id, "CompletionHolder")?.progressOf(meter);
  },
  strength: (game, id) => {
    game.reactor.read(`strength:${game.id}:${id}`);
    return game.registry.get(id, "StatLayer")?.value;
  },
  level: (game, id) => {
    game.reactor.read(`level:${game.id}:${id}`);
    return game.registry.get(id, "LevelHolder")?.level;
  },
  xpToNext: (game, id) => {
    game.reactor.read(`level:${game.id}:${id}`);
    return xpToNext(game.registry.get(id, "LevelHolder")?.level);
  },
  xp: (game, id) => {
    game.reactor.read(`xp:${game.id}:${id}`);
    return game.registry.get(id, "LevelHolder")?.xp;
  },

  parent: (_game, id) => parentOf(id),
  name: (game, id) => nameOf(id),

  add: (_game, ...args) => args.reduce((a, b) => a + b, ""),  // TODO - properly test string+number handling
  sub: (_game, ...args) => args.reduce((a, b) => a - b),
  mul: (_game, ...args) => args.reduce((a, b) => a * b, 1),
  div: (_game, ...args) => args.reduce((a, b) => a / b),
  min: (_game, ...args) => Math.min(...args),
  max: (_game, ...args) => Math.max(...args),
  neg: (_game, x) => -x,
  clamp: (_game, x, min, max) => Math.max(min, Math.min(max, x)),
  ternary: (_game, cond, t, f) => (cond ? t : f),
  roll: (game, min, max) => (Math.floor(game.rng() * (max - min + 1)) + min),

  // ── Boolean predicates ("requirements") ─────────────────────────────
  hasTag: (_game, id, tag) => tagsOf(id).includes(tag),

  active: (game, id) => {
    game.reactor.read(`active:${game.id}:${id}`);
    return game.active.isActive(id);
  },
  inactive: (game, id) => {
    game.reactor.read(`active:${game.id}:${id}`);
    return !game.active.isActive(id);
  },

  lt:  (_game, x, y) => x < y,
  gt:  (_game, x, y) => x > y,
  eq:  (_game, x, y) => x == y,
  neq: (_game, x, y) => x != y,
  geq: (_game, x, y) => x >= y,
  leq: (_game, x, y) => x <= y,

  skillMoreThan: (game, skill, value) => {
    game.reactor.read(`level:${game.id}:${skill}`);
    return game.registry.get(skill, "LevelHolder").level >= value;
  },
  skillBaseMoreThan: (game, skill, value) => {
    game.reactor.read(`level:${game.id}:${skill}`);
    return game.registry.get(skill, "LevelHolder").baseLevel >= value;
  },
  skillsImbalanced: (game, a, b) => {
    game.reactor.read(`level:${game.id}:${a}`);
    game.reactor.read(`level:${game.id}:${b}`);
    const A = game.registry.get(a, "LevelHolder").level;
    const B = game.registry.get(b, "LevelHolder").level;
    return (A / 2 > B) && (A - B > 10);
  },

  // Selector -> boolean bridge. `ids` resolves through the exact same
  // res() step as any other argument above - a selector is just a
  // function, same as a nested fml.* call, so it gets called with `game`
  // and reduced to its matched-id array before this body runs. No
  // isSelector special-case needed on this path: the reason
  // resolveFormulas() (below) skips selectors is that it resolves a
  // *structure's fields* for cartesian-product expansion elsewhere
  // (resolveTargets), a genuinely different job from resolving a
  // formula's own arguments, which is what lift() is for.
  any:  (_game, ids) => ids.length > 0,
  none: (_game, ids) => ids.length === 0,

  and:     (_game, ...bools) => bools.every(satisfied),
  or:      (_game, ...bools) => bools.some(satisfied),
  not:     (_game, x) => !satisfied(x),
  atLeast: (_game, n, ...bools) => bools.filter(satisfied).length >= n,
};


export const fml = Object.fromEntries(
  Object.entries(definitions).map(([name, fn]) => [name, lift(fn)]),
);


export function resolveFormulas(game, structure, { fields = null } = {}) {
  const result = { ...structure };
  for (const [key, val] of Object.entries(result)) {
    if (key === "type") continue;
    if (fields && !fields.includes(key)) continue;
    if (typeof val !== "function") continue;
    if (isSelector(val)) continue;
    result[key] = val(game);
  }
  return result;
}
