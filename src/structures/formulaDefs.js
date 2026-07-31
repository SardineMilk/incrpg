import { SKILLS } from "../data/skillsData.js";
import { isSelector } from "./selectorDefs.js";
import { byTag } from "../utils/tagIndex.js";

const res = (val, game) => (typeof val === "function" ? val(game) : val);
const lift =
  (fn) =>
  (...args) =>
  (game) =>
    fn(game, ...args.map((arg) => res(arg, game)));

// When adding a new formula it takes `game` as a parameter,
// but you don't need to pass game at point of use.
const definitions = {
  context: (game, key) => game.context.get(key),

  conditionStrength:  (game, condition) => game.registry.get(condition, "StatLayer")?.value,
  level:              (game, skill) => game.registry.get(skill, "LevelHolder")?.level,
  value:              (game, value) => game.values[value],
  skillParent:        (_game, skill) => SKILLS[skill]?.parent,

  add: (_game, x, y) => x + y,
  sub: (_game, x, y) => x - y,
  mul: (_game, x, y) => x * y,
  div: (_game, x, y) => x / y,
  min: (_game, x, y) => Math.min(x, y),
  max: (_game, x, y) => Math.max(x, y),
  clamp: (_game, x, min, max) => Math.max(min, Math.min(max, x)),
  ternary: (_game, cond, t, f) => (cond ? t : f),
  roll: (_game, min, max, threshold) => (Math.floor(Math.random() * (max - min + 1)) + min) >= threshold,
};


export const fml = Object.fromEntries(
  Object.entries(definitions).map(([name, fn]) => [name, lift(fn)]),
);


export function resolveFormulas(game, structure) {
  const result = { ...structure };
  for (const [key, val] of Object.entries(result)) {
    if (key === "type") continue;
    if (typeof val !== "function") continue;
    if (isSelector(val)) continue;
    result[key] = val(game);
  }
  return result;
}