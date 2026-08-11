export function processTrigger(game, triggerType, context, phase) {
  for (const id of game.active.view("TriggerHolder")) {
    const triggerHolder = game.registry.get(id, "TriggerHolder");
    const strength = game.registry.get(id, "StatLayer")?.value ?? 1;

    game.context.with(context, () => {
      const pending = triggerHolder.collect(game, triggerType, context, phase);
      if (pending.length === 0) return;

      processTrigger(game, "onTrigger", { id }, "pre");
      triggerHolder.apply(game, pending, strength);
      processTrigger(game, "onTrigger", { id }, "post");
    }, `trigger:${id}`);
  }
}
