import { getActiveAction } from "../utils/getActiveAction.js";

export function processTrigger(game, triggerType, context) {
  for (const id of game.registry.view("ActiveHolder", "TriggerHolder")) {
    const activeHolder = game.registry.get(id, "ActiveHolder");
    if (!activeHolder.active) continue;
    const triggerHolder = game.registry.get(id, "TriggerHolder");
    const strengthHolder = game.registry.get(id, "StatLayer");
    const strength = strengthHolder ? strengthHolder.value: 1;

    triggerHolder.fire(game, triggerType, context, strength);
  }
}

export function processModifier(game, triggerType, context) {
  for (const id of game.registry.view("ActiveHolder", "ModifierHolder")) {
    const activeHolder = game.registry.get(id, "ActiveHolder");
    if (!activeHolder.active) continue;
    const triggerHolder = game.registry.get(id, "ModifierHolder");
    const strengthHolder = game.registry.get(id, "StatLayer");
    const strength = strengthHolder ? strengthHolder.value: 1;

    triggerHolder.fire(game, triggerType, context, strength);
  }
}
