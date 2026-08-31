import { ActivationLayer } from "../utils/activationLayer.js";
import { EntityRegistry, registerEntities } from "../utils/entityRegistry.js";
import { NAMESPACES } from "../utils/state_creator.js";
import { applyEffect } from "./effects.js";;
import { ACTORS } from "../data/actorData.js"

// TODO - separate the referring ID from the definition ID
// URGENT, this is currently broken
let actorCounter = 0;

// Create the bare actor skeleton
// Used when loading saves
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

  world.actors.set(id, actor);
  world.reactor.notify("actors");

  return actor;
}

// Spawn a new actor, applying startup effects
export function spawnActor(world, { id, team = "neutral"} = {}) {
  const actorDef = ACTORS[id];  // TODO - make this less fragile
  const actor = createActor(world, { id, team, actorDef });

  for (const skillId in NAMESPACES.skills) {
    actor.registry.get(skillId, "LevelHolder").initPassives(actor);
  }

  if (actorDef?.startup?.length) {
    for (const effect of actorDef.startup) applyEffect(actor, effect);
  }

  return actor;
}