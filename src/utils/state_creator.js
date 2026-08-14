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

const NAMESPACES = {
  skills:     { ...SKILLS, },
  actions:    { ...ACTIONS, },
  activities: { ...ACTIVITIES, },
  conditions: { ...CONDITIONS, },
  locations:  { ...LOCATIONS, },
};

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

function rngFactory(seed) {
  let state = seed
  const rng = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  rng.getSeed = () => state;
  rng.setSeed = (s) => { state = s; };
  return rng
}



export function initialiseState() {
  const game = {};
  game.registry = new EntityRegistry();
  game.active = new ActivationLayer(game.registry);
  game.context = new ContextStack(MAX_STACK_DEPTH);
  game.candidateScope = new CandidateScope();
  game.reactor = new Reactor(MAX_STACK_DEPTH);
  game.rng = rngFactory(0);

  // TODO - if these are removed values are NaN until changed
  game.values = {
    health: 0,
    stamina: 0,
    mental: 0,
  },
  game.stats  = {};


  // Tag every entity with its own namespace name
  // This means namespaces must be distinct from any tag used in data
  for (const [namespace, dataset] of Object.entries(NAMESPACES)) {
    for (const id in dataset) {
      dataset[id].tags = [...(dataset[id].tags ?? []), namespace];
    }
  }

  validate(CONDITIONS, SKILLS, ACTIONS);

  for (const dataset of Object.values(NAMESPACES)) {
    generateTagIndex(dataset);
  }

  registerEntities(game.registry, NAMESPACES.skills, [
    LevelHolder
  ]);
  for (const id in NAMESPACES.skills) {
    game.registry.get(id, "LevelHolder").initPassives(game);
  }

  registerEntities(game.registry, NAMESPACES.actions, [
    PassiveHolder,
    TriggerHolder,
    ModifierHolder,
    CompletionHolder,
  ]);

  registerEntities(game.registry, NAMESPACES.activities, [
    PassiveHolder,
    TriggerHolder,
    CompletionHolder,
  ]);

  registerEntities(game.registry, NAMESPACES.conditions, [
    PassiveHolder,
    TriggerHolder,
    ModifierHolder,
    StatLayer,
    CompletionHolder,
  ]);

  registerEntities(game.registry, NAMESPACES.locations, [
    PassiveHolder,
    TriggerHolder,
  ]);

  return game;
}