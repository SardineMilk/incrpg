import { TRIGGER_DEFS } from "../structures/triggerDefs.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { applyEffect, applyScaledEffect } from "./effects.js";
import { meetsRequirements } from "./requirements.js";
import { withContext } from "../structures/formulaDefs.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { resolveFormulas } from "../structures/formulaDefs.js";

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
