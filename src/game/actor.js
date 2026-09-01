import { ActivationLayer } from "../utils/activationLayer.js";
import { EntityRegistry, registerEntities } from "../utils/entityRegistry.js";
import { NAMESPACES } from "../utils/state_creator.js";
import { applyEffect } from "./effects.js";;
import { ACTORS } from "../data/actorData.js"

const actorCounters = new Map(); // Per-definition counters

function getNextId(definitionId) {
  const current = actorCounters.get(definitionId) ?? 0;
  actorCounters.set(definitionId, current + 1);
  if (current == 0) return definitionId;
  return `${definitionId}_${current}`;
}

// Create the bare actor skeleton
// Used when loading saves
export function createActor(world, { id=null, defId, team = "neutral", actorDef = null } = {}) {
  if (!defId && !id) {
    throw new Error("createActor: must provide either id or definitionId");
  }

  id ??= getNextId(defId);

  if (world.actors.has(id)) {
    throw new Error(`createActor: id "${id}" already exists in this world`);
  }

  // Who needs smart separation of responsibility when you can just use references? Every actor contains multitudes <3 
  const actor = {
    id,
    defId,
    name: actorDef?.name ?? defId,
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

  world.actors.set(id, actor);
  world.reactor.notify("actors");

  return actor;
}

// Spawn a new actor, applying startup effects
export function spawnActor(world, { defId, team = "neutral"} = {}) {
  const actorDef = ACTORS[defId];
  const actor = createActor(world, { defId, team, actorDef });

  for (const skillId in NAMESPACES.skills) {
    actor.registry.get(skillId, "LevelHolder").initPassives(actor);
  }

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