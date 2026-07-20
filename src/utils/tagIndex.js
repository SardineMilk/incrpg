const _index = {};
const _allIds = {};  
const _entities = {}; 

export function generateTagIndex(namespace, dataset) {
  const ns = (_index[namespace] = {});
  _allIds[namespace] = Object.keys(dataset);

  for (const [id, def] of Object.entries(dataset)) {
    const tags = def.tags ?? [];

    if (_entities[id]) {
      console.warn(`Duplicate entity id across namespaces: "${id}" (${_entities[id].namespace} vs ${namespace})`);
    }

    _entities[id] = {
      name: def.name ?? id,
      description: def.description ?? "",
      tags,
      namespace,
    };

    for (const tag of tags) (ns[tag] ??= []).push(id);
  }
}

export function byTag(namespace, tag) { return _index[namespace]?.[tag] ?? []; }
export function allIds(namespace)     { return _allIds[namespace] ?? []; }

export function tagsOf(id)  { return _entities[id]?.tags ?? []; }
export function nameOf(id)  { return _entities[id]?.name ?? id; }
export function describe(id){ return _entities[id] ?? null; }