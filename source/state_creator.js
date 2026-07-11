import { SKILLS }     from "../data/skillsData.js";
import { ACTIONS }    from "../data/actionsData.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { LOCATIONS }  from "../data/locationsData.js";

import { StatLayer }          from "../components/statLayer.js";
import { EffectHolder }       from "../components/effectHolder.js";
import { TriggerHolder }      from "../components/triggerHolder.js";
import { ModifierHolder }      from "../components/modifierHolder.js";
import { CompletionHolder }   from "../components/completionHolder.js";
import { ProgressionHolder }  from "../components/progressionHolder.js";
import { ActiveHolder }       from "../components/activeHolder.js";

import { generateTagIndex } from "./tagIndex.js";
import { EntityRegistry, registerEntities } from "../components/entityRegistry.js";

export function initialiseState(game) {
  game.registry = new EntityRegistry();

  generateTagIndex("conditions", CONDITIONS);
  generateTagIndex("skills", SKILLS);
  generateTagIndex("locations", LOCATIONS);

  // Skills
  registerEntities(game.registry, SKILLS, [
    ProgressionHolder
  ]);

  registerEntities(game.registry, ACTIONS, [
      EffectHolder,
      TriggerHolder,
      ModifierHolder,
      CompletionHolder,
      ActiveHolder,
  ]);

  registerEntities(game.registry, CONDITIONS, [
      EffectHolder,
      TriggerHolder,
      ModifierHolder,
      StatLayer,
      ActiveHolder,
  ]);
}