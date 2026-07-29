// activationLayer.js
const EMPTY_SET = new Set();

export class ActivationLayer {
  constructor(registry) {
    this.registry = registry;
    this.active = new Set();

    // Allows view of active entities by component
    // Synced on (de)activation
    this._byComponent = new Map();
  }

  isActive(id) { return this.active.has(id); }

  activate(id) {
    if (this.active.has(id)) return;
    this.active.add(id);
    for (const type of this.registry.typesOf(id)) {
      this._indexFor(type).add(id);
    }
  }

  deactivate(id) {
    if (!this.active.has(id)) return;
    this.active.delete(id);
    for (const type of this.registry.typesOf(id)) {
      this._byComponent.get(type)?.delete(id);
    }
  }

  _indexFor(type) {
    let set = this._byComponent.get(type);
    if (!set) {
      set = new Set();
      this._byComponent.set(type, set);
    }
    return set;
  }

  // Active entities holding ALL of the given component types.
  // Iterates the smallest matching index, not the first argument,
  // so call-site ordering doesn't matter for cost.
  *view(...types) {
    if (types.length === 0) return;

    const sets = types.map(t => this._byComponent.get(t) ?? EMPTY_SET);
    sets.sort((a, b) => a.size - b.size);
    const [smallest, ...rest] = sets;

    outer: for (const id of smallest) {
      for (const s of rest) {
        if (!s.has(id)) continue outer;
      }
      yield id;
    }
  }
}