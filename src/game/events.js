export function processTrigger(game, triggerType, context) {
  for (const id of game.active.view("TriggerHolder")) {
    const triggerHolder = game.registry.get(id, "TriggerHolder");
    const strength = game.registry.get(id, "StatLayer")?.value ?? 1;

    game.context.with(context, () => {
      const pending = triggerHolder.collect(game, triggerType, context);
      if (pending.length === 0) return;

      processModifier(game, "onTrigger", { id });
      triggerHolder.apply(game, pending, strength);
      processTrigger(game, "onTrigger", { id });
    }, `trigger:${id}`);
  }
}

export function processModifier(game, triggerType, context) {
  for (const id of game.active.view("ModifierHolder")) {
    const modifierHolder = game.registry.get(id, "ModifierHolder");
    const strength = game.registry.get(id, "StatLayer")?.value ?? 1;

    game.context.with(context, () => {
      const pending = modifierHolder.collect(game, triggerType, context);
      if (pending.length === 0) return;

      processModifier(game, "onModifierTrigger", { id });
      modifierHolder.apply(game, pending, strength);
      processTrigger(game, "onModifierTrigger", { id });
    }, `modifier:${id}`);
  }
}