
import { ActivationLayer } from "../utils/activationLayer.js";
import { EntityRegistry, registerEntities } from "../utils/entityRegistry.js";
import { NAMESPACES } from "../utils/state_creator.js";
import { applyEffect } from "./effects.js";

let actorCounter = 0;
export function createActor(world, { id, team = "neutral", actorDef = null } = {}) {
  id ??= `actor_${actorCounter++}`;
  if (world.actors.has(id)) {
    throw new Error(`createActor: id "${id}" already exists in this world`);
  }

  const actor = {
    id,
    name: actorDef?.name ?? id,
    team,
    world,
    reactor: world.reactor,
    context: world.context,
    candidateScope: world.candidateScope,
    rng: world.rng,
    registry: EntityRegistry.cloneFrom(world.templateRegistry),
    values: { health: 0, stamina: 0, mental: 0, ...actorDef?.values },
    stats: { ...actorDef?.stats },
  };
  actor.active = new ActivationLayer(actor.registry);

  Object.defineProperty(actor, "log", {
    get: () => world.log,
    enumerable: true,
  });

  for (const skillId in NAMESPACES.skills) {
    actor.registry.get(skillId, "LevelHolder").initPassives(actor);
  }

  world.actors.set(id, actor);
  world.reactor.notify("actors");

  if (actorDef?.startup?.length) {
    for (const effect of actorDef.startup) applyEffect(actor, effect);
  }

  return actor;
}

export function allActors(world) {
  world.reactor.read("actors");
  return [...world.actors.values()];
}

export function actorById(world, id) {
  world.reactor.read("actors");
  return world.actors.get(id);
}

export function actorsByTeam(world, team) {
  return allActors(world).filter((a) => a.team === team);
}

export function actorsExcludingTeam(world, team) {
  return allActors(world).filter((a) => a.team !== team);
}

export function actorsWhere(world, predicate) {
  return allActors(world).filter(predicate);
}