// entityRegistry.js
const EMPTY_SET = new Set();

export class EntityRegistry {
  constructor() {
    this.entities = new Set();
    this.components = new Map();
    this.typesByEntity = new Map();  // static
  }

  create(id) {
    this.entities.add(id);
    if (!this.typesByEntity.has(id)) this.typesByEntity.set(id, new Set());
  }

  add(id, component) {
    const key = component.constructor.name;

    if (!this.components.has(key)) this.components.set(key, new Map());
    this.components.get(key).set(id, component);

    if (!this.typesByEntity.has(id)) this.typesByEntity.set(id, new Set());
    this.typesByEntity.get(id).add(key);
  }

  get(id, typeName) {
    return this.components.get(typeName)?.get(id);
  }

  has(id, typeName) {
    return this.components.get(typeName)?.has(id) ?? false;
  }

  // Static component types for an entity, used to build index for ActivationLayer
  // Limitation - entity components must be static, they can't dynamically change
  typesOf(id) { return this.typesByEntity.get(id) ?? EMPTY_SET; }

  // All entities of a type, active or not
  // ActivationLayer.view is more often used to only return active 
  *view(...typeNames) {
    const componentMaps = typeNames.map(name => this.components.get(name));
    if (componentMaps.some(map => !map)) return;

    const primary = componentMaps[0];
    for (const id of primary.keys()) {
      if (componentMaps.every(map => map.has(id))) yield id;
    }
  }
}

export function registerEntities(registry, data, components) {
  for (const [id, def] of Object.entries(data)) {
    registry.create(id);

    for (const Component of components) {
      // Not all entities will actually make use of all their components
      // e.g. conditions without trigger effects
      // So skip adding them to the registry, improving performance
      if (Component.appliesTo && !Component.appliesTo(def)) continue;

      registry.add(id, Component.fromDefinition(def));
    }
  }
}