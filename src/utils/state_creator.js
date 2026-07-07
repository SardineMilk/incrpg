import { SKILLS }     from "../data/skillsData.js";
import { ACTIONS }    from "../data/actionsData.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { LOCATIONS }  from "../data/locationsData.js";
import { StatLayer }    from "../components/statLayer.js";
import { generateTagIndex } from "./tagIndex.js";
import { EffectHolder } from "../components/effectHolder.js";
import { TriggerHolder } from "../components/triggerHolder.js";
import { CompletionHolder } from "../components/completionHolder.js";
import { ProgressionHolder } from "../components/progressionHolder.js";
import { ActiveHolder } from "../components/activeHolder.js";

export function initialiseState(game) {

  generateTagIndex("conditions", CONDITIONS);
  generateTagIndex("skills",     SKILLS);
  generateTagIndex("locations",  LOCATIONS);

  // Skills
  game.skills = {};
  for (const id in SKILLS) {
    const def = SKILLS[id];
    game.skills[id] = {
      progressionHolder: new ProgressionHolder(def.level, def.milestones, def.name),
    };
  }

  // Actions
  game.actionStates = {};
  for (const id in ACTIONS) {
    const def = ACTIONS[id];
    game.actionStates[id] = {
      effectHolder:       new EffectHolder(def.effects ?? []),
      triggerHolder:  new TriggerHolder(ACTIONS[id].triggers ?? []),
      completableHolder:  new CompletionHolder(def.duration, def.result),

      competency:         1,

      // TODO Active component, replacing game.activeAction
    };
  }

  game.conditionStates = {};
  for (const id in CONDITIONS) {
    game.conditionStates[id] = {
      effectHolder:   new EffectHolder(CONDITIONS[id].effects ?? []),
      triggerHolder:  new TriggerHolder(CONDITIONS[id].triggers ?? []),
      strengthHolder: new StatLayer({flat:1}),
      activeHolder:   new ActiveHolder(),
    };
  }

  // Track which action currently has its passive effects applied
  game.actionWithAppliedEffects = game.actionWithAppliedEffects ?? null;
}