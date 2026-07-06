import { ACTIONS } from "../data/actionsData.js";
import { applyEffect, applyEffectTracked, removeEffect } from "./effects.js";
import { game } from "./state.js";


function calculateActionSkillFactor(game, action) {
  let factor = 0;
  for (const [skillId, skillFactor] of Object.entries(action.skills)) {
    const state = game.skills[skillId];
    const level = state.progressionHolder.level;
    factor += level * skillFactor * 0.01;
  }
  return factor;
}

function calculateActionAttributeFactor(game, action) {
  let factor = 0;
  for (const [attributeId, attributeFactor] of Object.entries(action.attributes)) {
    const state = game.skills[attributeId];
    const level = state.progressionHolder.level;
    factor += level * attributeFactor * 0.01;
  }
  return factor;
}

export function calculateActionCompetency(game, actionId) {
  const action = ACTIONS[actionId];
  const skillFactor     = calculateActionSkillFactor(game, action);
  const attributeFactor = calculateActionAttributeFactor(game, action);
  return 1 + skillFactor + attributeFactor;
}
