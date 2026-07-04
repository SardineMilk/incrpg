import { SKILLS }     from "../data/skillsData.js";
import { ACTIONS }    from "../data/actionsData.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { LOCATIONS }  from "../data/locationsData.js";
import { makeStatLayer }    from "./statLayer.js";
import { generateTagIndex } from "./tagIndex.js";
import { EffectHolder } from "../components/effectHolder.js";
import { TriggerHolder } from "../components/triggerHolder.js";
import { Completable } from "../components/completable.js";

export function initialiseState(game) {

  generateTagIndex("conditions", CONDITIONS);
  generateTagIndex("skills",     SKILLS);
  generateTagIndex("locations",  LOCATIONS);

  // Skills
  game.skills = game.skills || {};
  for (const skillId in SKILLS) {
    game.skills[skillId] = game.skills[skillId] || {
      xp:           0,
      base:         0,
      xpMultiplier: 1,
      bonus:        makeStatLayer(),
      level:        0,
    };
  }

  // Actions
  game.actions = game.actions || {};
  for (const id in ACTIONS) {
    const def = ACTIONS[id];
    game.actions[id] = game.actions[id] || {
      completableHolder: new Completable(def.duration, def.result),
      competency:     1,
      effectHolder: new EffectHolder(def.effects ?? []),
    };
  }

  game.conditionStates = game.conditionStates || {};
  for (const conditionId in CONDITIONS) {
    game.conditionStates[conditionId] = {
      active:         false,
      duration:       null,
      strength:       makeStatLayer(),
      new:            false,   // true for one tick after first activation
      needsReapply:   false,   // did strength change this tick: reapply at tick end
      effectHolder: new EffectHolder(CONDITIONS[conditionId].effects ?? []),
      triggerHolder: new TriggerHolder(CONDITIONS[conditionId].triggers ?? []),
    };
    game.conditionStates[conditionId].strength.flat = 1;
  }

  // Track which action currently has its passive effects applied
  game.actionWithAppliedEffects = game.actionWithAppliedEffects ?? null;
}