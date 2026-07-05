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


export function initialiseState(game) {

  generateTagIndex("conditions", CONDITIONS);
  generateTagIndex("skills",     SKILLS);
  generateTagIndex("locations",  LOCATIONS);

  // Skills
  game.skills = {};
  for (const skillId in SKILLS) {
    const def = SKILLS[skillId];
    game.skills[skillId] = game.skills[skillId] || {
      progressionHolder: new ProgressionHolder(def.level, def.milestones, def.name),
    };
  }

  // Actions
  game.actions = {};
  for (const id in ACTIONS) {
    const def = ACTIONS[id];
    game.actions[id] = game.actions[id] || {
      completableHolder:  new CompletionHolder(def.duration, def.result),
      effectHolder:       new EffectHolder(def.effects ?? []),
      competency:         1,
    };
  }

  game.conditionStates = {};
  for (const conditionId in CONDITIONS) {
    game.conditionStates[conditionId] = {
      effectHolder:   new EffectHolder(CONDITIONS[conditionId].effects ?? []),
      triggerHolder:  new TriggerHolder(CONDITIONS[conditionId].triggers ?? []),
      strengthHolder: new StatLayer({flat:1}),

      // TODO Duration component
      // Roll new, reuse progressionHolder or inherit Active component?
      duration:       null,
      // TODO Active component
      active:         false,
      new:            false,   // true for one tick after first activation
      needsReapply:   false,   // did strength change this tick: reapply at tick end

    };
  }

  // Track which action currently has its passive effects applied
  game.actionWithAppliedEffects = game.actionWithAppliedEffects ?? null;
}