import { isSelector } from "./selectorDefs.js";
import { byTag, parentOf } from "../utils/tagIndex.js";
import { xpToNext } from "../utils/math.js";

const res = (val, game) => (typeof val === "function" ? val(game) : val);
const lift =
  (fn) =>
  (...args) =>
  (game) =>
    fn(game, ...args.map((arg) => res(arg, game)));

// When adding a new formula it always takes `game` as a parameter,
// but you don't need to pass game at point of use.
const definitions = {
  // Get data from current effect stack, with shortcuts for the most common uses
  context: (game, key) => game.context.get(key),
  id: (game) => game.context.get("id"),
  amount: (game) => game.context.get("amount"),

  // Get data from current expanded selector candidate
  // Niche, but required in some cases where multiple fields use the candidate
  // eff.gainXp(sel.tags("skills"), fml.level(fml.candidate("id")))
  candidate: (game, key) => game.candidateScope.get(key),


  value: (game, value) => {
    game.reactor.read(`value:${value}`);
    return game.values[value];
  },
  duration: (game, id) => {
    game.reactor.read(`meter:${id}:duration`);
    return game.registry.get(id, "CompletionHolder")?.progressOf("duration");
  },
  progress: (game, id, meter) => {
    game.reactor.read(`meter:${id}:${meter}`);
    return game.registry.get(id, "CompletionHolder")?.progressOf(meter);
  },
  strength: (game, id) => {
    game.reactor.read(`strength:${id}`);
    return game.registry.get(id, "StatLayer")?.value;
  },
  level: (game, id) => {
    game.reactor.read(`level:${id}`);
    return game.registry.get(id, "LevelHolder")?.level;
  },
  xpToNext: (game, id) => {
    game.reactor.read(`level:${id}`);
    return xpToNext(game.registry.get(id, "LevelHolder")?.level);
  },
  xp: (game, id) => {
    game.reactor.read(`xp:${id}`);
    return game.registry.get(id, "LevelHolder")?.xp;
  },

  parent: (_game, id) => parentOf(id),

  add: (_game, x, y) => x + y,
  sub: (_game, x, y) => x - y,
  mul: (_game, x, y) => x * y,
  div: (_game, x, y) => x / y,
  neg: (_game, x) => -x,
  min: (_game, x, y) => Math.min(x, y),
  max: (_game, x, y) => Math.max(x, y),
  clamp: (_game, x, min, max) => Math.max(min, Math.min(max, x)),
  ternary: (_game, cond, t, f) => (cond ? t : f),
  roll: (game, min, max) => (Math.floor(game.rng() * (max - min + 1)) + min),
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