import { initialiseState, rngFactory, NAMESPACES } from "./state_creator.js";


// TODO - extract to config file or smth
export const SAVE_VERSION = 1;
const STORAGE_KEY = "savegame";

export function serializeGame(game) {
  const components = {};

  for (const id of game.registry.entities) {
    const entry = {};
    for (const typeName of game.registry.typesOf(id)) {
      const component = game.registry.get(id, typeName);
      // Only components with getState are saved
      // Some are stateless, and are constructed from data by initialiseState()
      if (typeof component?.getState === "function") {
        entry[typeName] = component.getState();
      }
    }
    if (Object.keys(entry).length > 0) components[id] = entry;
  }

  return {
    version: SAVE_VERSION,
    values: structuredClone(game.values),
    flags: structuredClone(game.flags ?? {}),
    rngSeed: game.rng.getSeed(),
    active: [...game.active.active],
    components,
  };
}


// TODO - migrations
export function deserializeGame(save) {
  const game = initialiseState();

  game.values = structuredClone(save.values);
  game.stats  = structuredClone(save.stats ?? {});
  game.rng    = rngFactory(save.rngSeed);

  for (const [id, entry] of Object.entries(save.components)) {
    for (const [typeName, state] of Object.entries(entry)) {
      game.registry.get(id, typeName)?.setState(state);
    }
  }

  for (const id of save.active) game.active.activate(id);

  for (const id of save.active) {
    const strength = game.registry.get(id, "StatLayer")?.value ?? 1;
    game.registry.get(id, "PassiveHolder")?.prime(game, strength);
    game.reactor.notifyAll();  // Hacky not-quite-fix for mid-cascade saves
  }
  for (const id of Object.keys(NAMESPACES.skills)) {
    game.registry.get(id, "LevelHolder")?.primePassives(game);
    game.reactor.notifyAll();
  }

  return game;
}


export function saveToStorage(game) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeGame(game)));
    return true;
  } catch (err) {
    console.error("saveToStorage failed:", err);
    return false;
  }
}

export function hasStoredSave() {
  return localStorage.getItem(STORAGE_KEY) != null;
}

export function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return deserializeGame(JSON.parse(raw));
  } catch (err) {
    console.error("loadFromStorage failed - save may be corrupt:", err);
    return null;
  }
}

export function clearStoredSave() {
  localStorage.removeItem(STORAGE_KEY);
}