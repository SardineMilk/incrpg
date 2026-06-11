import { SKILLS } from "../data/skillsData.js";
import { ACTIONS } from "../data/actionsData.js";

export function initialiseState(game) {
  game.skills = game.skills || {};
  for (const skillId in SKILLS) {
    game.skills[skillId] = game.skills[skillId] || {
      xp: 0,
      base: 0,
      multiplier: 1,
      bonus: { flat: 0, multiplier: 1 },
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
}
