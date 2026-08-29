// utils/save.js
import { createActor, NAMESPACES } from "./state_creator.js";

export const SAVE_VERSION = 1;
const STORAGE_KEY = "savegame";

function serializeActor(actor) {
  const components = {};

  for (const id of actor.registry.entities) {
    const entry = {};
    for (const typeName of actor.registry.typesOf(id)) {
      const component = actor.registry.get(id, typeName);
      // Only components with getState are saved
      // Some are stateless, and are constructed from data by createActor()
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

// TODO - allow actors other than the player to persist
export function serializeGame(world, player) {
  return {
    version: SAVE_VERSION,
    rngSeed: world.rng.getSeed(),
    actors: [serializeActor(player)],
  };
}


function deserializeActor(actor, saved) {
  actor.values = structuredClone(saved.values);
  actor.stats  = structuredClone(saved.stats ?? {});

  // Any component that contains state should define the setState() method
  // Example:
  // completionHolder tracks progress and completion count, so it does
  // triggerHolder has no state beyond what is defined in the data files, so it doesn't
  for (const [id, entry] of Object.entries(saved.components)) {
    for (const [typeName, state] of Object.entries(entry)) {
      actor.registry.get(id, typeName)?.setState(state);
    }
  }

  // Activate entities without going through the standard activateEntity() wrapper
  // This means there are no side effects e.g. evt.onActivate()
  for (const id of saved.active) actor.active.activate(id);

  // prime() is a copy of apply() with one change: it doesn't actually apply effects
  // this means the reactor with all subscriptions can be rebuilt
  // without trying to remove/reapply passives, which would be very messy
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

// TODO - generalise player away
export function deserializeGame(world, save) {
  world.rng.setSeed(save.rngSeed);

  const [playerSave] = save.actors;
  const player = createActor(world, { id: playerSave.id, team: playerSave.team });
  deserializeActor(player, playerSave);

  return player;
}


export function saveToStorage(world, player) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeGame(world, player)));
    return true;
  } catch (err) {
    console.error("saveToStorage failed:", err);
    return false;
  }
}

export function hasStoredSave() {
  return localStorage.getItem(STORAGE_KEY) != null;
}

// TODO - generalise actors, don't return player explicitly
export function loadFromStorage(world) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return deserializeGame(world, JSON.parse(raw));
  } catch (err) {
    console.error("loadFromStorage failed - save may be corrupt:", err);
    return null;
  }
}

export function clearStoredSave() {
  localStorage.removeItem(STORAGE_KEY);
}