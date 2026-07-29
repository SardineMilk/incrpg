
// TODO - allow modifiers to use onTrigger
// Probably requires splitting .fire() into .check() and .fire()
// Because modifiers would execute only when firing would occur, but before it actually does

export function processTrigger(game, triggerType, context) {
  for (const id of game.active.view("TriggerHolder")) {
    const triggerHolder = game.registry.get(id, "TriggerHolder");
    const strengthHolder = game.registry.get(id, "StatLayer");
    const strength = strengthHolder ? strengthHolder.value: 1;

    const res = triggerHolder.fire(game, triggerType, context, strength);
    if (res) processTrigger(game, "onTrigger", { id: id });
  }
}

export function processModifier(game, triggerType, context) {
  for (const id of game.active.view("ModifierHolder")) {
    const triggerHolder = game.registry.get(id, "ModifierHolder");
    const strengthHolder = game.registry.get(id, "StatLayer");
    const strength = strengthHolder ? strengthHolder.value: 1;

    const res = triggerHolder.fire(game, triggerType, context, strength);
    if (res) processTrigger(game, "onModifierTrigger", { id: id });  // TODO - how should this work?
  }
}
