import { SKILLS }     from "../data/skillsData.js";
import { ACTIONS }    from "../data/actionsData.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { LOCATIONS }  from "../data/locationsData.js";

import { StatLayer }          from "../components/statLayer.js";
import { PassiveHolder }       from "../components/passiveHolder.js";
import { TriggerHolder }      from "../components/triggerHolder.js";
import { ModifierHolder }      from "../components/modifierHolder.js";
import { CompletionHolder }   from "../components/completionHolder.js";
import { LevelHolder }  from "../components/levelHolder.js";
import { ActiveHolder }       from "../components/activeHolder.js";

import { generateTagIndex } from "./tagIndex.js";
import { EntityRegistry, registerEntities } from "../components/entityRegistry.js";
import { validate } from "./validator.js";


const NAMESPACES = {
  skills: SKILLS,
  actions: ACTIONS,
  conditions: CONDITIONS,
  locations: LOCATIONS,
};

export function initialiseState(game) {
  game.registry = new EntityRegistry();

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
    ActiveHolder,
  ]);

  registerEntities(game.registry, CONDITIONS, [
    PassiveHolder,
    TriggerHolder,
    ModifierHolder,
    StatLayer,
    ActiveHolder,
  ]);
}