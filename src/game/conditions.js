import { CONDITIONS } from "../data/conditionsData.js";
import { applyScaledEffect, applyEffect } from "./effects.js";
import { meetsRequirements } from "./requirements.js";

export function processConditions(game) {
  decrementConditionDuration(game);
  applyConditionStrengthEffects(game);

  // Apply all other effects
  for (const [id, state] of Object.entries(game.activeConditions)) {
    const conditionDef = CONDITIONS[id];

    // Dont apply conditions with triggers
    if (conditionDef.triggers) continue;
    for (const effect of conditionDef.effects) {
      if (effect.type === "changeConditionStrength") continue; // already handled
      if (!meetsRequirements(game, conditionDef)) continue;

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

    // Dont apply conditions with triggers
    if (conditionDef.triggers) continue;
    if (!meetsRequirements(game, conditionDef)) continue;
    for (const effect of conditionDef.effects) {
      if (effect.type !== "changeConditionStrength") continue; // only strength modifiers
      applyEffect(game, effect);
    }
  }
}
