import { ActivationLayer } from "../utils/activationLayer.js";
import { EntityRegistry, registerEntities } from "../utils/entityRegistry.js";
import { NAMESPACES } from "../utils/state_creator.js";
import { applyEffect } from "./effects.js";
import { ACTORS } from "../data/actorData.js";
import { EFFECT_DEFS } from "../structures/effectDefs.js";
import { EventLog } from "./log.js";

// Per-world counters; 
// skips taken ids, so spawning after a load wont collide with restored actors
function getNextId(world, definitionId) {
  const counters = (world.actorCounters ??= new Map());
  let n = counters.get(definitionId) ?? 0;
  let id;
  do {
    id = n === 0 ? definitionId : `${definitionId}_${n}`;
    n++;
  } while (world.actors.has(id));
  counters.set(definitionId, n);
  return id;
}

// Create the bare actor skeleton
// Used when loading saves
export function createActor(world, { id=null, defId, team = "neutral", actorDef = null } = {}) {
  if (!defId && !id) {
    throw new Error("createActor: must provide either id or definitionId");
  }

  id ??= getNextId(world, defId);

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
  actor.log = new EventLog({ reactor: world.reactor, id });

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

export function despawnActor(world, actor) {
  if (actor.dead) return false;
  actor.dead = true;                 // from here on the actor is inert
  world.actors.delete(actor.id);
  world.reactor.notify("actors");    // UI actor lists drop its widgets first

  // Unwind everything the actor holds in shared state (subscriptions, global passives)
  for (const id of [...actor.active.active]) EFFECT_DEFS.deactivate.apply(actor, { id });
  for (const id of actor.registry.view("LevelHolder")) {
    actor.registry.get(id, "LevelHolder").dispose();
  }
  return true;
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