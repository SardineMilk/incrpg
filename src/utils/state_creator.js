import { SKILLS } from "../data/skillsData.js";
import { ACTIONS } from "../data/actionsData.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { makeStatLayer } from "./statLayer.js";

export function initialiseState(game) {
  game.log = 

  game.skills = game.skills || {};
  for (const skillId in SKILLS) {
    game.skills[skillId] = game.skills[skillId] || {
      xp: 0,
      base: 0,
      xpMultiplier: 1,
      bonus: { flat: 0, multiplier: 1 },
      level: 0,
    };
  }

  game.actions = game.actions || {};
  for (const action in ACTIONS) {
    game.actions[action] = game.actions[action] || {
      progress: 0,
      completions: 0,
      competency: 1,
    };
  }

  for (const conditionId in CONDITIONS) {
    game.conditionStates[conditionId] = {
      active: false, 
      duration: null, 
      strength: makeStatLayer(),
      new: false,
      strengthOnApply: 1,
    };
    game.conditionStates[conditionId].strength.flat = 1;
  }
}
