import { CONDITIONS } from "../data/conditionsData.js";
import { applyEffectTracked, removeEffect, changeEffectStrength } from "./effects.js";
import { resolveStatLayer } from "../utils/statLayer.js";

// ── Duration management ───────────────────────────────────────────────────────

export function decrementConditionDuration(game) {
  for (const conditionId in game.conditionStates) {
    const state = game.conditionStates[conditionId];
    if (!state.active)          continue;
    if (state.duration == null) continue;

    if (state.duration <= 0) {
      removeConditionEffects(game, conditionId);
      state.active   = false;
      state.duration = null;
      continue;
    }

    state.duration -= 1;
  }
}


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

export function applyConditionEffects(game, conditionId) {
  const state = game.conditionStates[conditionId];
  const def   = CONDITIONS[conditionId];
  if (!def?.effects?.length) return;

  const strength = resolveStatLayer(state.strength);
  const applied  = [];

  for (const effect of def.effects) {
    const scaled   = changeEffectStrength(game, effect, strength);
    const resolved = applyEffectTracked(game, scaled);
    applied.push(...resolved);
  }

  state.appliedEffects = applied;
}

export function removeConditionEffects(game, conditionId) {
  const state = game.conditionStates[conditionId];
  if (!state.appliedEffects?.length) return;

  // Reverse order so stacked multipliers unwind correctly
  // Probably not necessary, but tracking down this bug would be horrible
  for (let i = state.appliedEffects.length - 1; i >= 0; i--) {
    removeEffect(game, state.appliedEffects[i]);
  }
  state.appliedEffects = [];
}

export function reapplyConditionEffects(game, conditionId) {
  removeConditionEffects(game, conditionId);
  applyConditionEffects(game, conditionId);
}
