import { isSelector } from "./selectorDefs.js";
import { byTag, nameOf, parentOf, tagsOf } from "../utils/tagIndex.js";
import { xpToNext } from "../utils/math.js";

const res = (val, game) => (typeof val === "function" ? val(game) : val);
const lift =
  (fn) =>
  (...args) =>
  (game) =>
    fn(game, ...args.map((arg) => res(arg, game)));

// An absent (null/undefined) argument to and/or/not/atLeast - a def that
// never set an optional requirements/visibility field - is treated as
// vacuously satisfied, matching the top-level convention (see
// game/requirements.js#check: "no requirement = true"). Applying that
// same rule here lets a composed formula fold in an optional slot (e.g.
// panelsData.js's visibilityOf()) without it counting as a hard failure
// just because nothing was there to check.
const satisfied = (b) => b == null || !!b;

// When adding a new formula it always takes `game` as a parameter,
// but you don't need to pass game at point of use.
//
// This dictionary covers both value-producing formulas (value, level,
// add, ...) and boolean predicates (active, gt, and, any, ...) - a
// "requirement" is just a formula whose result happens to be treated as
// a boolean by whoever calls it (see game/requirements.js#check). They
// share one namespace and one composition mechanism (lift/res above)
// because the engine doesn't otherwise distinguish value types: nothing
// about how a formula is built or called cares whether it returns a
// number, an id, or a boolean.
//
// and/or/not/atLeast are ordinary entries here, built the same way as
// every other formula below - there is no separate "logic node" type and
// no dispatch table anywhere for them. They compose for free through
// lift()'s existing argument resolution: each argument that's a function
// (a nested fml.* call, or a sel.* selector passed to any/none) gets
// called with `game` before the outer formula's own body runs, exactly
// like fml.add(fml.value(...), 5) already worked before this file had
// any boolean-returning entries in it.
const definitions = {
  // Get data from current effect stack, with shortcuts for the most common uses
  ctx: (game, key) => game.context.get(key),
  id: (game) => game.context.get("id"),
  amount: (game) => game.context.get("amount"),
  // Set by eff.onTarget() (effectDefs.js) around the nested effect it
  // applies to a target actor - the id of whoever called onTarget. Lets a
  // target's own triggers react to who's responsible (thorns, retaliate-
  // on-hit, etc.) without needing any other way to identify them. Reads
  // as undefined outside of an onTarget-driven effect.
  sourceActor: (game) => game.context.get("actor"),

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
