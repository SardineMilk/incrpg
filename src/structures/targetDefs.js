// targetDefs.js
//
// Actor-targeting selectors, consumed by eff.onTarget() (effectDefs.js) to
// pick which actor(s) in the world an effect should be applied to.
import { sample } from "../utils/math.js";

const TARGET_SELECTOR = Symbol("targetSelector");

export function isTargetSelector(val) {
  return typeof val === "function" && val[TARGET_SELECTOR] === true;
}

// Arguments can be literals or nested formulas/selectors (e.g.
// target.actor(fml.sourceActor())) - resolved against `game` at call time,
// same convention as formulaDefs.js's lift()/res().
const res = (val, game) => (typeof val === "function" ? val(game) : val);

function lift(fn) {
  return (...args) => {
    const wrapped = (game) => fn(game, ...args.map((arg) => res(arg, game)));
    wrapped[TARGET_SELECTOR] = true;
    return wrapped;
  };
}


function liveActors(game) {
  game.reactor.read("actors");
  return [...game.world.actors.values()];
}

const definitions = {
  self: (game) => [game.id],
  actor: (game, id) => [id],
  team: (game, team) => liveActors(game).filter((a) => a.team === team).map((a) => a.id),
  all: (game) => liveActors(game).map((a) => a.id),

  // TODO - structure this better
  enemies: (game) => liveActors(game).filter((a) => a.team !== game.team).map((a) => a.id),
  allies: (game) =>liveActors(game).filter((a) => a.team === game.team && a.id !== game.id).map((a) => a.id),

  // TODO - this is a clone of sel.random()
  random: (game, selector, count = 1) => sample(game.rng, selector, count),

  withActive: (game, id) =>
    liveActors(game)
      .filter((a) => {
        game.reactor.read(`active:${a.id}:${id}`);
        return a.active.isActive(id);
      })
      .map((a) => a.id),
};

export const target = Object.fromEntries(
  Object.entries(definitions).map(([name, fn]) => [name, lift(fn)]),
);
