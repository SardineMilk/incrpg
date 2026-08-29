import { isSelector } from "./selectorDefs.js";
import { byTag, nameOf, parentOf } from "../utils/tagIndex.js";
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
  ctx: (game, key) => game.context.get(key),
  id: (game) => game.context.get("id"),
  amount: (game) => game.context.get("amount"),

  // Get data from current expanded selector candidate
  // Niche, but required in some cases where multiple fields use the candidate
  // eff.gainXp(sel.tags("skills"), fml.level(fml.candidate("id")))
  candidate: (game, key) => game.candidateScope.get(key),



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