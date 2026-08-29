import { SKILLS } from "../data/skillsData.js";
import { ACTIONS } from "../data/actionsData.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { LOCATIONS } from "../data/locationsData.js";
import { ACTIVITIES } from "../data/activitiesData.js"

import { StatLayer } from "../components/statLayer.js";
import { PassiveHolder } from "../components/passiveHolder.js";
import { TriggerHolder } from "../components/triggerHolder.js";
import { CompletionHolder } from "../components/completionHolder.js";
import { LevelHolder } from "../components/levelHolder.js";
import { ModifierHolder } from "../components/modifierHolder.js";

import { generateTagIndex } from "./tagIndex.js";
import { EntityRegistry, registerEntities } from "./entityRegistry.js";
import { ActivationLayer } from "./activationLayer.js";
import { Reactor } from "./reactor.js";

import { validate } from "./validator.js";
import { ContextStack } from "./context.js";
import { CandidateScope } from "./candidateScope.js";


/*
* Some entities in the game might cause infinite loops
* Examples:
* - evt.valueGain("foo") -> eff.changeValue("foo", 1)
* - eff.changeValue("healthMax", fml.value("healthMax"))
* This will often be a long chain of multiple interacting entities
* To combat this, the effect stack has a depth limit
* Past this depth, the stack will stop accepting new context
* Instead, it will gracefully resolve the existing stack
* Increase this number to make infinite loops last longer before being resolved
* Decrease for better performance in the case of infinite loops
* If it is too low, normal game operation may be impacted 
*/
const MAX_STACK_DEPTH = 64;

export function rngFactory(seed) {
  let state = seed
  const rng = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  rng.getSeed = () => state;
  rng.setSeed = (s) => { state = s; };
  return rng
}

export const NAMESPACES = {
  skills:     { ...SKILLS, },
  actions:    { ...ACTIONS, },
  activities: { ...ACTIVITIES, },
  conditions: { ...CONDITIONS, },
  locations:  { ...LOCATIONS, },
};


export function initialiseWorld() {
  const world = {};
  world.context = new ContextStack(MAX_STACK_DEPTH);
  world.candidateScope = new CandidateScope();
  world.reactor = new Reactor(MAX_STACK_DEPTH);
  world.rng = rngFactory(0);

  world.log = null;

  world.actors = new Map();

  for (const [namespace, dataset] of Object.entries(NAMESPACES)) {
    for (const id in dataset) {
      dataset[id].tags = [...(dataset[id].tags ?? []), namespace];
    }
  }

  validate(CONDITIONS, SKILLS, ACTIONS);

  for (const dataset of Object.values(NAMESPACES)) {
    generateTagIndex(dataset);
  }

  return world;
}


let actorCounter = 0;

export function createActor(world, { id, team = "neutral" } = {}) {
  id ??= `actor_${actorCounter++}`;
  if (world.actors.has(id)) {
    throw new Error(`createActor: id "${id}" already exists in this world`);
  }

  const actor = {
    id,
    team,
    world,  // escape hatch just in case
    reactor: world.reactor,
    context: world.context,
    candidateScope: world.candidateScope,
    rng: world.rng,
    registry: new EntityRegistry(),
    values: { health: 0, stamina: 0, mental: 0 },  // TODO - remove this hardcoding  
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