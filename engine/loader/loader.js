import { registerContent } from "./registry.js";

const locate = (path) => new URL(path, import.meta.url);

async function readJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`loader: could not read ${url}`);
  return response.json();
}

/*
Build an array of the correct order to load mods
If this is impossible, throw an error
*/
function loadOrder(ids, manifests) {
  const ordered = [];
  const state = new Map();

  const visit = (id, from) => {
    if (!manifests.has(id)) throw new Error(`loader: "${from}" needs "${id}", which is not in modlist.json`);

    if (state.get(id) === "done") return;
    if (state.get(id) === "visiting") throw new Error(`loader: dependency cycle at "${id}"`);

    state.set(id, "visiting");
    const manifest = manifests.get(id);
    for (const dep of manifest.requires ?? []) visit(dep, id);
    for (const dep of manifest.loadAfter ?? []) if (manifests.has(dep)) visit(dep, id);
    state.set(id, "done");

    ordered.push(manifest);
  };

  for (const id of ids) visit(id, "modlist.json");
  return ordered;
}

async function load() {
  // Get all mods added to current game
  const ids = await readJson(locate("../../modlist.json"));
  const manifests = new Map();
  // Get all manifests
  // important part is their requirements 
  for (const id of ids) {
    const manifest = await readJson(locate(`../../mods/${id}/mod.json`));
    manifests.set(id, manifest);
  }

  // Load in the correct order, using the dependency tree
  for (const manifest of loadOrder(ids, manifests)) {
    // get all data from mod
    const { default: bundle } = await import(locate(`../../mods/${manifest.id}/index.js`).href);
    registerContent(manifest, bundle);
  }
}

let loading = null;

export function loadMods() {
  return (loading ??= load());
}
