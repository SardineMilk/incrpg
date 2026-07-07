
// Called by applyEffect after each effect is applied.
// Walks all active conditions and fires any who's triggers match.
export function processTrigger(game, triggerType, context) {
  for (const id in game.conditionStates) {
    const state = game.conditionStates[id];
    if (!state.activeHolder.active || !state.triggerHolder) continue;
    const strength = state.strengthHolder ? state.strengthHolder.value : 1;
    state.triggerHolder.fire(game, triggerType, context, strength);
  }

  for (const id in game.actionStates) {
    const state = game.actionStates[id];

    if (!(game.activeAction === id) || !state.triggerHolder) continue;
    const strength = state.strengthHolder ? state.strengthHolder.value : 1;
    state.triggerHolder.fire(game, triggerType, context, strength);
  }
}
