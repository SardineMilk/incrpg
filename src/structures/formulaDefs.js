import { SKILLS } from "../data/skillsData.js";
import { game } from "../game/state.js";
import { isSelector } from "./selectorDefs.js";

const res = (val) => (typeof val === "function" ? val() : val);
export const lift =
  (fn) =>
  (...args) =>
  () =>
    fn(game, ...args.map(res));

const _contextStack = [];
export function withContext(ctx, fn) {
  _contextStack.push(ctx);
  try {
    return fn();
  } finally {
    _contextStack.pop();
  }
}
function currentContext() {
  return _contextStack[_contextStack.length - 1] ?? {};
}

// When adding a new formula it takes `game` as a parameter,
// but you don't need to pass game at point of use.
const definitions = {
  contextAmount: (_game) => currentContext().amount,
  contextSkill: (_game) => currentContext().skill,
  contextCondition: (_game) => currentContext().condition,

  // TODO - when this is undefined, it makes nasty bugs. Make sure this doesnt happen again
  conditionStrength: (game, condition) =>
    game.conditionStates[condition]?.strength,
  attribute: (game, attribute) => game.attributes[attribute]?.value,
  value: (game, value) => game.values[value],
  skillLevel: (game, skill) => game.skills[skill]?.level,
  skillParent: (_game, skill) => SKILLS[skill]?.parent,

  add: (_game, x, y) => x + y,
  sub: (_game, x, y) => x - y,
  mul: (_game, x, y) => x * y,
  div: (_game, x, y) => x / y,
  min: (_game, x, y) => Math.min(x, y),
  max: (_game, x, y) => Math.max(x, y),
  clamp: (_game, x, min, max) => Math.max(min, Math.min(max, x)),
  ternary: (_game, cond, t, f) => (cond ? t : f),
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