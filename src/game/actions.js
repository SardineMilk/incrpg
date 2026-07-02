import { ACTIONS } from "../data/actionsData.js";
import { applyEffectTracked, removeEffect } from "./effects.js";


function calculateActionSkillFactor(game, action) {
  let factor = 0;
  for (const [skillId, skillFactor] of Object.entries(action.skills)) {
    const skill = game.skills[skillId];
    factor += skill.level * skillFactor * 0.01;
  }
  return factor;
}

function calculateActionAttributeFactor(game, action) {
  let factor = 0;
  for (const [attribute, attributeFactor] of Object.entries(action.attributes)) {
    factor += game.skills[attribute].level * attributeFactor * 0.01;
  }
  return factor;
}

export function calculateActionsCompetency(game) {
  for (const action in ACTIONS) {
    const skillFactor     = calculateActionSkillFactor(game, ACTIONS[action]);
    const attributeFactor = calculateActionAttributeFactor(game, ACTIONS[action]);
    game.actions[action].competency = 1 + skillFactor + attributeFactor;
  }
}

export function calculateActionCompetency(game, actionId) {
  const action = ACTIONS[actionId];
  game.actions[actionId] = game.actions[actionId] || {
    progress: 0, completions: 0, competency: 1, appliedEffects: [],
  };
  const skillFactor     = calculateActionSkillFactor(game, action);
  const attributeFactor = calculateActionAttributeFactor(game, action);
  game.actions[actionId].competency = 1 + skillFactor + attributeFactor;
}


// Actions can declare an `effects` array of passive modifiers 
// These are applied while the action is active
// And removed when action changes
// applyActionEffects   — call when an action becomes active
// removeActionEffects  — call when the active action changes or is cleared

// TODO - generalise this 
export function applyActionEffects(game, actionId) {
  const state = game.actions[actionId];
  if (!state?.effectHolder) return;
  state.effectHolder.apply(game);
}

export function removeActionEffects(game, actionId) {
  const state = game.actions[actionId];
  if (!state?.effectHolder) return;
  state.effectHolder.remove(game);
}