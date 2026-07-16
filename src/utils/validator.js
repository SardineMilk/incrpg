export function validate(...entity_collections) {
    const ENTITIES = Object.assign(entity_collections)

    // Find duplicated entries 
    // Any shared properties between the entities in entity_collections
    // TODO - fix this
    const seen = new Set()
    for (const collection of entity_collections) {
        for (const id in collection) {
            if (seen.has(id)) console.warn(`Duplicated ID: ${id}`)
            seen.add(id);
        }
    }

}

