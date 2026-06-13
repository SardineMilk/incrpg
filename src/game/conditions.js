import { CONDITIONS } from "../data/conditionsData.js";
import { applyScaledEffect, applyEffect } from "./effects.js";
import { meetsRequirements } from "./requirements.js";

export function processConditions(game) {
  decrementConditionDuration(game);
  applyConditionStrengthEffects(game);

  // Apply all other effects
  for (const [id, state] of Object.entries(game.activeConditions)) {
    const conditionDef = CONDITIONS[id];

    if (conditionDef.triggers) continue;  // Dont apply conditions with triggers
    if (!meetsRequirements(game, conditionDef)) continue;  // Only apply if condition meets requitements
    for (const effect of conditionDef.effects) {
      if (effect.type === "changeConditionStrength") continue; // already handled

      if (state.strength != 1) applyScaledEffect(game, effect, state.strength);
      else applyEffect(game, effect);
    }
  }
}

function decrementConditionDuration(game) {
  // Tick down durations, remove expired conditions
  for (const [id, state] of Object.entries(game.activeConditions)) {
    if (state.duration !== undefined) {
      if (state.duration <= 0) {
        delete game.activeConditions[id];
        continue;
      }
      state.duration -= 1;
    }
  }
}

function applyConditionStrengthEffects(game) {
  // Apply all strength modifiers
  for (const [id, state] of Object.entries(game.activeConditions)) {
    const conditionDef = CONDITIONS[id];

    if (conditionDef.triggers) continue;  // Dont apply conditions with triggers
    if (!meetsRequirements(game, conditionDef)) continue;  // Only apply if condition meets requitements

    for (const effect of conditionDef.effects) {
      if (effect.type !== "changeConditionStrength") continue; // only strength modifiers
      applyEffect(game, effect);
    }
  }
}
