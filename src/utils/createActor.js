import { CompletionHolder } from "../components/completionHolder.js";
import { LevelHolder } from "../components/levelHolder.js";
import { ModifierHolder } from "../components/modifierHolder.js";
import { PassiveHolder } from "../components/passiveHolder.js";
import { StatLayer } from "../components/statLayer.js";
import { TriggerHolder } from "../components/triggerHolder.js";
import { ActivationLayer } from "./activationLayer.js";
import { EntityRegistry, registerEntities } from "./entityRegistry.js";
import { NAMESPACES } from "./state_creator.js";

let actorCounter = 0;
export function createActor(world, { id, team = "neutral" } = {}) {
    id ??= `actor_${actorCounter++}`;
    if (world.actors.has(id)) {
        throw new Error(`createActor: id "${id}" already exists in this world`);
    }

    const actor = {
        id,
        team,
        world, // escape hatch just in case
        reactor: world.reactor,
        context: world.context,
        candidateScope: world.candidateScope,
        rng: world.rng,
        registry: new EntityRegistry(),
        values: { health: 0, stamina: 0, mental: 0 }, // TODO - remove this hardcoding  
        stats: {},
    };
    actor.active = new ActivationLayer(actor.registry);

    // Replace this once log is properly initialised, not in tick.js
    Object.defineProperty(actor, "log", {
        get: () => world.log,
        enumerable: true,
    });

    registerEntities(actor.registry, NAMESPACES.skills, [
        LevelHolder
    ]);
    for (const skillId in NAMESPACES.skills) {
        actor.registry.get(skillId, "LevelHolder").initPassives(actor);
    }

    registerEntities(actor.registry, NAMESPACES.actions, [
        PassiveHolder,
        TriggerHolder,
        ModifierHolder,
        CompletionHolder,
    ]);

    registerEntities(actor.registry, NAMESPACES.activities, [
        PassiveHolder,
        TriggerHolder,
        CompletionHolder,
    ]);

    registerEntities(actor.registry, NAMESPACES.conditions, [
        PassiveHolder,
        TriggerHolder,
        ModifierHolder,
        StatLayer,
        CompletionHolder,
    ]);

    registerEntities(actor.registry, NAMESPACES.locations, [
        PassiveHolder,
        TriggerHolder,
    ]);

    world.actors.set(id, actor);
    return actor;
}
