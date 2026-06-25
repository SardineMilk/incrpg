import { CONDITIONS } from "../data/conditionsData.js";
import { applyScaledEffect, applyEffect } from "./effects.js";
import { meetsRequirements } from "./requirements.js";
import { resolveStatLayer } from "../utils/statLayer.js";


export function decrementConditionDuration(game) {
  // Tick down durations, remove expired conditions
  for (const conditionId in game.conditionStates) {
    const state = game.conditionStates[conditionId];
    if (!state.active)          continue;
    if (state.duration == null) continue; 
    
    if (state.duration <= 0) {
      removeCondition(conditionId);
      continue;
    }
    
    state.duration -= 1;
  }
}

// What should be this and what should  be in effectDefs.applyCondition
export function applyCondition(conditionId, duration=null) {
  const state = game.conditionStates[conditionId];
  const def = CONDITIONS[conditionId];

  state.active = true;
  state.duration = duration  // If null, indefinite duration

  const conditionStrength = resolveStatLayer(state.strength);

  if (!def.effects) return;
  for (const effect of def.effects) {
    applyScaledEffect(game, effect, conditionStrength);
  }
}

function removeCondition(conditionId) {
  const state = game.conditionStates[conditionId];
  const def = CONDITIONS[conditionId];

  state.active = false;
  state.duration = null;

  console.log(state.strengthOnApply)
  const removeStrength = -1 * state.strengthOnApply

  if (!def.effects) return;
  for (const effect of def.effects) {
    applyScaledEffect(game, effect, removeStrength);
  }

}