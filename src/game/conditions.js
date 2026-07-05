import { CONDITIONS } from "../data/conditionsData.js";
import { applyEffectTracked, removeEffect, changeEffectStrength } from "./effects.js";




// Conditions can declare an effects array of passive modifiers 
// These are applied while the action is active
// And removed when action changes
// These are distinct from triggers (which fire reactively)
//
// applyConditionEffects   - called once when a condition first becomes active
// removeConditionEffects  - called when a condition expires or is removed
// reapplyConditionEffects - called when the condition's strength changes
//
// Each resolved effect object is stored in state.appliedEffects so that
// state mutations have no impact on effect removal

function decrementConditionDuration(game) {
  for (const conditionId in game.conditionStates) {
    const state = game.conditionStates[conditionId];
    if (!state.active)          continue;
    if (state.duration == null) continue;

    state.duration -= 1;
  }
}

// TODO - generalise this
export function applyConditionEffects(game, conditionId) {
  const state = game.conditionStates[conditionId];
  if (!state?.effectHolder) return;
  state.effectHolder.apply(game, state.strengthHolder.value);
}

export function removeConditionEffects(game, conditionId) {
  const state = game.conditionStates[conditionId];
  state.effectHolder?.remove(game);
}

export function reapplyConditionEffects(game, conditionId) {
  const state = game.conditionStates[conditionId];
  state.effectHolder?.reapply(game, state.strengthHolder.value);
}

export function processConditions(game) {
  decrementConditionDuration(game);

  // Apply effects for newly added conditions
  for (const conditionId in game.conditionStates) {
    const c = game.conditionStates[conditionId];
    if (!c.active || !c.new) continue;
    c.new = false;
    applyConditionEffects(game, conditionId);
  }

  // If condition strength has been changed by eff.changeConditionStrength,
  // reapply the effects with new strength
  for (const conditionId in game.conditionStates) {
    const c = game.conditionStates[conditionId];
    if (!c.active) continue;
    if (!c.strengthHolder.consumeDirty()) continue;
    reapplyConditionEffects(game, conditionId);
  }

  // Remove effects for stale conditions
  for (const conditionId in game.conditionStates) {
    const c = game.conditionStates[conditionId];
    if (c.duration == null || c.duration > 0) continue;
    if (!c.active) continue;

    removeConditionEffects(game, conditionId);
    c.active   = false;
    c.duration = null;
  }
}