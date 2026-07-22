
export function processTrigger(game, triggerType, context) {
  for (const id of game.registry.view("TriggerHolder")) {
    if (!game.activation.active.has(id)) continue;
    const triggerHolder = game.registry.get(id, "TriggerHolder");
    const strengthHolder = game.registry.get(id, "StatLayer");
    const strength = strengthHolder ? strengthHolder.value: 1;

    triggerHolder.fire(game, triggerType, context, strength);
  }
}

export function processModifier(game, triggerType, context) {
  for (const id of game.registry.view("ModifierHolder")) {
    if (!game.activation.active.has(id)) continue;
    const triggerHolder = game.registry.get(id, "ModifierHolder");
    const strengthHolder = game.registry.get(id, "StatLayer");
    const strength = strengthHolder ? strengthHolder.value: 1;

    triggerHolder.fire(game, triggerType, context, strength);
  }
}
