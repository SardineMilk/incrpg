export const NAMESPACES = {
  skills: {},
  actions: {},
  activities: {},
  conditions: {},
  locations: {},
};

// TODO - move these to NAMESPACES
export const ACTORS = {};
export const PANELS = {};

const TABLES = { ...NAMESPACES, actors: ACTORS, panels: PANELS };

export function defineMod(bundle) {
  for (const type of Object.keys(bundle)) {
    if (!(type in TABLES)) throw new Error(`defineMod: unknown content type "${type}"`);
  }
  return bundle;
}

export function registerContent(manifest, bundle) {
  for (const [type, defs] of Object.entries(defineMod(bundle))) {
    const table = TABLES[type];
    for (const [id, def] of Object.entries(defs)) {
      if (id in table) {
        throw new Error(`mod "${manifest.id}": ${type} id "${id}" is already registered`);
      }
      table[id] = { ...def };
    }
  }
}
