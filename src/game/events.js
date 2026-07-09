
// Called by applyEffect after each effect is applied.

import { getActiveAction } from "../utils/getActiveAction.js";

// Walks all active conditions and fires any who's triggers match.
export function processTrigger(game, triggerType, context) {
  // TODO - generalise this
  for (const id in game.conditionStates) {
    const state = game.conditionStates[id];
    if (!state.activeHolder.active || !state.triggerHolder) continue;
    const strength = state.strengthHolder ? state.strengthHolder.value : 1;
    state.triggerHolder.fire(game, triggerType, context, strength);
  }

  for (const id in game.actionStates) {
    const state = game.actionStates[id];

    if (!(getActiveAction() === id) || !state.triggerHolder) continue;
    const strength = state.strengthHolder ? state.strengthHolder.value : 1;
    state.triggerHolder.fire(game, triggerType, context, strength);
  }
}

export function processModifier(game, triggerType, context) {
  // TODO - generalise this
  for (const id in game.conditionStates) {
    const state = game.conditionStates[id];
    if (!state.activeHolder.active || !state.triggerHolder) continue;
    const strength = state.strengthHolder ? state.strengthHolder.value : 1;
    state.modifierHolder.fire(game, triggerType, context, strength);
  }

  for (const id in game.actionStates) {
    const state = game.actionStates[id];

    if (!(getActiveAction() === id) || !state.triggerHolder) continue;
    const strength = state.strengthHolder ? state.strengthHolder.value : 1;
    state.modifierHolder.fire(game, triggerType, context, strength);
  }
}
