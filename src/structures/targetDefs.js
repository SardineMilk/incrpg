// targetDefs.js
//
// Actor-targeting selectors, consumed by eff.onTarget() (effectDefs.js) to
// pick which actor(s) in the world an effect should be applied to.
//
// These are deliberately NOT the same thing as sel.* in selectorDefs.js.
// sel.* resolves to *entity ids* inside the current actor's own registry
// (skills/actions/conditions/locations - see selectorDefs.js's SELECTOR
// symbol). target.* resolves to *actor ids* in the world. Handing a sel.*
// selector to eff.onTarget(), or a target.* selector to a normal effect's
// entity-selector field, would silently do the wrong thing (an actor id
// looked up as an entity, or vice versa) rather than throw - so the two
// are tagged with different symbols, and eff.onTarget() checks for its
// own tag at creation time and refuses anything else outright.
//
// Resolution timing: a target.* selector is just a function like any
// formula, so game/effects.js#resolveFormulas() evaluates it automatically
// against the *source* actor (whoever called eff.onTarget()) before
// EFFECT_DEFS.onTarget.apply() ever runs. By the time apply() sees it,
// e.selector is already a plain array of actor ids, not a function.

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
  random: (game, selector, count=1) => {
    const ids = res(selector, game);
    if (ids.length === 0) return [];
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, ids.length));
  },

};

export const target = Object.fromEntries(
  Object.entries(definitions).map(([name, fn]) => [name, lift(fn)]),
);
