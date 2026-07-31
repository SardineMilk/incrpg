export function processTrigger(game, triggerType, context) {
  for (const id of game.active.view("TriggerHolder")) {
    const triggerHolder = game.registry.get(id, "TriggerHolder");
    const strengthHolder = game.registry.get(id, "StatLayer");
    const strength = strengthHolder ? strengthHolder.value : 1;

    const pending = triggerHolder.fire(game, triggerType, context);
    if (pending.length === 0) continue;

    // TODO - this doesnt preserve the context stack properly
    // Should context even be a parameter?
    // Should context even be a stack, or threaded like game?
    // TODO - investigate
    processModifier(game, "onTrigger", { id },);
    triggerHolder.apply(game, pending, strength, context);
    processTrigger(game, "onTrigger", { id },);
  }
}

export function processModifier(game, triggerType, context) {
  for (const id of game.active.view("ModifierHolder")) {
    const triggerHolder = game.registry.get(id, "ModifierHolder");
    const strengthHolder = game.registry.get(id, "StatLayer");
    const strength = strengthHolder ? strengthHolder.value : 1;

    const pending = triggerHolder.fire(game, triggerType, context);
    if (pending.length === 0) continue;

    processModifier(game, "onModifierTrigger", { id },);
    triggerHolder.apply(game, pending, strength, context);
    processTrigger(game, "onModifierTrigger", { id },);
  }
}