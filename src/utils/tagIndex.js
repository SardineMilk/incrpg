const _index = {};
const _entities = {}; 

export function generateTagIndex(dataset) {
  for (const [id, def] of Object.entries(dataset)) {
    const tags = def.tags ?? [];
    _entities[id] = { name: def.name ?? id, tags, parent: def.parent };
    for (const tag of tags) (_index[tag] ??= []).push(id);
  }
}

// Returns ids of all entities that have tag
export function byTag(tag) { return _index[tag] ?? []; }

export function allIds() { return Object.keys(_entities); }
export function tagsOf(id)  { return _entities[id]?.tags ?? []; }
export function nameOf(id)  { return _entities[id]?.name ?? id; }
export function parentOf(id)  { return _entities[id]?.parent; }
export function describe(id){ return _entities[id] ?? null; }