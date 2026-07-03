import { meetsRequirements } from "../game/requirements.js";
import { applyEffect, applyScaledEffect } from "../game/effects.js";
import { withContext, resolveFormulas } from "../structures/formulaDefs.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { TRIGGER_DEFS } from "../structures/triggerDefs.js";

export class TriggerHolder {
  constructor(triggerDefs = []) {
    this.triggerDefs = triggerDefs;
  }

  get isTriggerHolder() {
    return this.triggerDefs.length > 0;
  }

  fire(game, triggerType, context, strength = null) {
    if (!this.triggerDefs.length) return;

    for (const t of this.triggerDefs) {
      if (!t?.event) continue;
      if (t.event.type !== triggerType) continue;
      if (!this._matches(game, t.event, context)) continue;
      if (!meetsRequirements(game, t)) continue;

      withContext(context, () => {
        for (const effect of t.effects) {
          if (strength != null) {
            applyScaledEffect(game, effect, strength);
          } else {
            applyEffect(game, effect);
          }
        }
      });
    }
  }

  // Resolves any selector on the trigger's event object
  // and checks it against the fired context via the trigger's def.check().
  _matches(game, event, context) {
    const expanded = resolveTargets(game, event);
    return expanded.some((e) => {
      const resolved = resolveFormulas(game, e);
      const def = TRIGGER_DEFS[resolved.type];
      if (!def) {
        console.warn("Unknown trigger type:", resolved.type);
        return false;
      }
      return def.check(resolved, context);
    });
  }
}