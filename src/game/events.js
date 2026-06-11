import { TRIGGER_DEFS } from "../data/triggerDefs.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { applyEffect, applyScaledEffect } from "./effects.js";
import { meetsRequirements } from "./requirements.js";
import { withContext } from "../data/formulaDefs.js";

// Called by applyEffect after each effect is applied.
// Walks all active conditions and fires any whose triggers match.
export function processTrigger(game, triggerType, context) {
  for (const [id, state] of Object.entries(game.activeConditions)) {
    const def = CONDITIONS[id];
    if (!def.triggers) continue;

    const matching = def.triggers.filter((t) => t.type === triggerType);
    if (!matching.length) continue;
    if (!matching.some((t) => checkTrigger(t, context))) continue;
    if (!meetsRequirements(game, def)) continue;

    withContext(context, () => {
      for (const effect of def.effects) {
        if (state.strength !== 1)
          applyScaledEffect(game, effect, state.strength);
        else applyEffect(game, effect);
      }
    });
  }
}

function checkTrigger(trigger, context) {
  const def = TRIGGER_DEFS[trigger.type];
  if (!def) {
    console.warn("Unknown trigger type:", trigger.type);
    return false;
  }
  return def.check(trigger, context);
}
