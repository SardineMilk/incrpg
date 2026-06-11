import { SKILLS } from "./skillsData.js";
import { game } from "../game/state.js";

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

  conditionStrength: (game, condition) =>
    game.activeConditions[condition]?.strength,
  resourceCurrent: (game, resource) => game.resources[resource]?.current,
  flagValue: (game, flag) => game.flags[flag],
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
