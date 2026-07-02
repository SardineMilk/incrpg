import { SKILLS }     from "../data/skillsData.js";
import { ACTIONS }    from "../data/actionsData.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { LOCATIONS }  from "../data/locationsData.js";
import { makeStatLayer }    from "./statLayer.js";
import { generateTagIndex } from "./tagIndex.js";
import { EffectHolder } from "../components/effectHolder.js";

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
      bonus:        { flat: 0, multiplier: 1 },
      level:        0,
    };
  }

  // Actions
  game.actions = game.actions || {};
  for (const action in ACTIONS) {
    game.actions[action] = game.actions[action] || {
      progress:       0,
      completions:    0,
      competency:     1,
      effectHolder: new EffectHolder(ACTIONS[action].effects ?? []),
    };
  }

  for (const conditionId in CONDITIONS) {
    game.conditionStates[conditionId] = {
      active:         false,
      duration:       null,
      strength:       makeStatLayer(),
      new:            false,   // true for one tick after first activation
      needsReapply:   false,   // did strength change this tick: reapply at tick end
      effectHolder: new EffectHolder(CONDITIONS[conditionId].effects ?? []),
    };
    game.conditionStates[conditionId].strength.flat = 1;
  }

  // Track which action currently has its passive effects applied
  game.actionWithAppliedEffects = game.actionWithAppliedEffects ?? null;
}