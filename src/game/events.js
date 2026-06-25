import { TRIGGER_DEFS } from "../structures/triggerDefs.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { applyEffect, applyScaledEffect } from "./effects.js";
import { meetsRequirements } from "./requirements.js";
import { withContext, resolveFormulas } from "../structures/formulaDefs.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { resolveStatLayer } from "../utils/statLayer.js";

// Called by applyEffect after each effect is applied.
// Walks all active conditions and fires any whose triggers match.
export function processTrigger(game, triggerType, context) {
  for (const conditionId in game.conditionStates) {
    const def = CONDITIONS[conditionId];
    const state = game.conditionStates[conditionId];

    if (!state.active) continue;

    if (!def.triggers) continue;

    for (const i in def.triggers) {
      const t = def.triggers[i];
      const event = t.event;

      // TODO remove once all conditions converted. Should be in validator
      if (!t.event) return;  

      if (t.event.type !== triggerType) continue;
      if (!checkTrigger(t.event, context)) continue;
      if (!meetsRequirements(game, t)) continue;
      withContext(context, () => {
        for (const effect of t.effects) {
          applyScaledEffect(game, effect, resolveStatLayer(state.strength));
        }
      });

    }
  }
}

function checkTrigger(trigger, context) {
  const expanded = resolveTargets(game, trigger);
  return expanded.some((t) => {
    const r = resolveFormulas(game, t);
    const def = TRIGGER_DEFS[r.type];
    if (!def) {
      console.warn("Unknown trigger type:", r.type);
      return false;
    }
    return def.check(r, context);
  });
}
