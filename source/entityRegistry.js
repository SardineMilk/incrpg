export class EntityRegistry {
    constructor() {
        this.entities = new Set();
        this.components = new Map();
    }

    create(id) {
        this.entities.add(id);
    }

    add(id, component) {
        const key = component.constructor.name;

        if (!this.components.has(key)) {
            this.components.set(key, new Map());
        }

        this.components
            .get(key)
            .set(id, component);
    }

    get(id, typeName) {
        return this.components.get(typeName)?.get(id);
    }

    *view(...typeNames) {
        const componentMaps = typeNames.map(
            name => this.components.get(name)
        );

        if (componentMaps.some(map => !map)) return;

        const primary = componentMaps[0];

        for (const id of primary.keys()) {
            if (componentMaps.every(map => map.has(id))) {
                yield id;
            }
        }
    }
}

export function registerEntities(registry, data, components) {
    for (const [id, def] of Object.entries(data)) {
        registry.create(id);

        for (const Component of components) {
            registry.add(id, Component.fromDefinition(def));
        }
    }
}