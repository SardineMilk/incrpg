import { TRIGGER_DEFS } from "../structures/triggerDefs.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { applyEffect, applyScaledEffect } from "./effects.js";
import { meetsRequirements } from "./requirements.js";
import { withContext, resolveFormulas } from "../structures/formulaDefs.js";
import { resolveTargets } from "../structures/selectorDefs.js";

// Called by applyEffect after each effect is applied.
// Walks all active conditions and fires any who's triggers match.
export function processTrigger(game, triggerType, context) {
  for (const conditionId in game.conditionStates) {
    const state = game.conditionStates[conditionId];

    if (!state.active) continue;
    if (!state.triggerHolder) continue;

    let strength = 1;
    if (state.strengthHolder) {
      strength = state.strengthHolder.value;
    }

    state.triggerHolder.fire(game, triggerType, context, strength);
  }
}
