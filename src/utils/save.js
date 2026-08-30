import { NAMESPACES } from "./state_creator.js";
import { createActor } from "../game/actor.js";

export const SAVE_VERSION = 1;  // TODO - shove this in a config file somewhere
const STORAGE_KEY = "savegame";

function serializeActor(actor) {
  const components = {};

  for (const id of actor.registry.entities) {
    const entry = {};
    for (const typeName of actor.registry.typesOf(id)) {
      const component = actor.registry.get(id, typeName);
      if (typeof component?.getState === "function") {
        entry[typeName] = component.getState();
      }
    }
    if (Object.keys(entry).length > 0) components[id] = entry;
  }

  return {
    id: actor.id,
    team: actor.team,
    values: structuredClone(actor.values),
    stats: structuredClone(actor.stats),
    active: [...actor.active.active],
    components,
  };
}

// Saves every actor currently in the world.
// Should probably add some limits to this...
export function serializeGame(world) {
  return {
    version: SAVE_VERSION,
    rngSeed: world.rng.getSeed(),
    actors: [...world.actors.values()].map(serializeActor),
  };
}


function deserializeActor(actor, saved) {
  actor.values = structuredClone(saved.values);
  actor.stats = structuredClone(saved.stats ?? {});

  for (const [id, entry] of Object.entries(saved.components)) {
    for (const [typeName, state] of Object.entries(entry)) {
      actor.registry.get(id, typeName)?.setState(state);
    }
  }

  for (const id of saved.active) actor.active.activate(id);

  for (const id of saved.active) {
    const strength = actor.registry.get(id, "StatLayer")?.value ?? 1;
    actor.registry.get(id, "PassiveHolder")?.prime(actor, strength);
    actor.reactor.notifyAll();  // Hacky not-quite-fix for mid-cascade saves
  }
  // TODO - dont use bare NAMESPACES
  for (const id of Object.keys(NAMESPACES.skills)) {
    actor.registry.get(id, "LevelHolder")?.primePassives(actor);
    actor.reactor.notifyAll();
  }
}

// Populates world.actors from a save
export function deserializeGame(world, save) {
  world.rng.setSeed(save.rngSeed);

  for (const actorSave of save.actors) {
    const actor = createActor(world, { id: actorSave.id, team: actorSave.team });
    deserializeActor(actor, actorSave);
  }
}


export function saveToStorage(world) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeGame(world)));
    return true;
  } catch (err) {
    console.error("saveToStorage failed:", err);
    return false;
  }
}

export function hasStoredSave() {
  return localStorage.getItem(STORAGE_KEY) != null;
}


export function loadFromStorage(world) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    deserializeGame(world, JSON.parse(raw));
    return true;
  } catch (err) {
    console.error("loadFromStorage failed - save may be corrupt:", err);
    return false;
  }
}

export function clearStoredSave() {
  localStorage.removeItem(STORAGE_KEY);
}