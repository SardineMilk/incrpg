export class ActivationLayer {
  constructor(registry) {
    this.registry = registry;
    this.active = new Set();
  }

  isActive(id)   { return this.active.has(id); }
  activate(id)   { this.active.add(id); }
  deactivate(id) { this.active.delete(id); }

  *view(...componentTypes) {
    const maps = componentTypes.map(t => this.registry.components.get(t));
    if (maps.some(m => !m)) return;
    for (const id of this.active) {
      if (maps.every(m => m.has(id))) yield id;
    }
  }
}