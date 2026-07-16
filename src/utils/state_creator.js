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

export function initialiseState(game) {
  game.registry = new EntityRegistry();

  
  validate(CONDITIONS, SKILLS, ACTIONS);

  generateTagIndex("conditions", CONDITIONS);
  generateTagIndex("skills", SKILLS);
  generateTagIndex("locations", LOCATIONS);

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