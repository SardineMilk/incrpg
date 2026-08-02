import { SKILLS } from "../data/skillsData.js";
import { ACTIONS } from "../data/actionsData.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { LOCATIONS } from "../data/locationsData.js";

import { StatLayer } from "../components/statLayer.js";
import { PassiveHolder } from "../components/passiveHolder.js";
import { TriggerHolder } from "../components/triggerHolder.js";
import { ModifierHolder } from "../components/modifierHolder.js";
import { CompletionHolder } from "../components/completionHolder.js";
import { LevelHolder } from "../components/levelHolder.js";
import { DurationHolder } from "../components/durationHolder.js";

import { generateTagIndex } from "./tagIndex.js";
import { EntityRegistry, registerEntities } from "./entityRegistry.js";
import { ActivationLayer } from "./activationLayer.js";

import { validate } from "./validator.js";
import { ContextStack } from "./context.js";
import { CandidateScope } from "./candidateScope.js";


const NAMESPACES = {
  skills: SKILLS,
  actions: ACTIONS,
  conditions: CONDITIONS,
  locations: LOCATIONS,
};

const MAX_CONTEXT_STACK_DEPTH = 64;

export function initialiseState() {
  const game = {};
  game.registry = new EntityRegistry();
  game.active = new ActivationLayer(game.registry);
  game.context = new ContextStack(MAX_CONTEXT_STACK_DEPTH);
  game.candidateScope = new CandidateScope();
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

  // Skills
  registerEntities(game.registry, SKILLS, [
    LevelHolder
  ]);

  registerEntities(game.registry, ACTIONS, [
    PassiveHolder,
    TriggerHolder,
    ModifierHolder,
    CompletionHolder,
    DurationHolder,
  ]);

  registerEntities(game.registry, CONDITIONS, [
    PassiveHolder,
    TriggerHolder,
    ModifierHolder,
    StatLayer,
    DurationHolder,
  ]);

  return game;
}