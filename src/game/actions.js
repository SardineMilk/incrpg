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


// Actions can declare an `effects` array of passive modifiers 
// These are applied while the action is active
// And removed when action changes
// applyActionEffects   — call when an action becomes active
// removeActionEffects  — call when the active action changes or is cleared

// TODO - generalise this 
export function applyActionEffects(game, actionId) {
  const state = game.actionStates[actionId];
  if (!state?.effectHolder) return;
  state.effectHolder.apply(game);
}

export function removeActionEffects(game, actionId) {
  const state = game.actionStates[actionId];
  if (!state?.effectHolder) return;
  state.effectHolder.remove(game);
}


export function processAction() {
  const current_id = game.activeAction;

  const action = ACTIONS[current_id];
  const state = game.actionStates[current_id];

  if (action == undefined) console.warn("Current action not in ACTIONS:", current_id);
  if (!action) return;

  state.completableHolder.advanceProgress(game, 1);

  // Grant attribute XP
  if (action.attributes) {
    for (const id in action.attributes) {
      const amount = action.attributes[id];
      if (amount == 0) continue;
      game.skills[id].progressionHolder.grantXp(game, action.attributes[id])
    }
  }

}
