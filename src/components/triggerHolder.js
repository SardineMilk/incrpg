import { meetsRequirements } from "../game/requirements.js";
import { resolveFormulas } from "../structures/formulaDefs.js";
import { withContext } from "../utils/context.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { TRIGGER_DEFS } from "../structures/triggerDefs.js";
import { applyEffect } from "../game/effects.js";

export class TriggerHolder {
  constructor(triggerDefs = []) {
    this.triggerDefs = triggerDefs;
  }

  static fromDefinition(def) {
    return new TriggerHolder(
      def.triggers,
    );
  }

  static appliesTo(def) {
    return (def.triggers?.length ?? 0) > 0;
  }

  // TODO - .fire() should return an array of effects, which are applied at the call site
  // This allows pre-fire modifiers to work properly

  // Returns true if any trigger fired
  fire(game, triggerType, context) {
    const pending = [];

    for (const t of this.triggerDefs) {
      if (t.event.type !== triggerType) continue;

      withContext(context, () => {
        if (!this._matches(game, t.event, context)) return;
        if (!meetsRequirements(game, t)) return;
        for (const effect of t.effects) { pending.push(effect); }
      });
    }

    return pending;
  }

  // TODO - this is stupid
  apply(game, pending, strength) {
    for (const effect of pending) { applyEffect(game, effect, strength); }
  }

  // Resolves any selector on the trigger's event object
  // and checks it against the fired context via the trigger's def.check().
  _matches(game, event, context) {
    const expanded = resolveTargets(game, event);
    return expanded.some((e) => {
      const resolved = resolveFormulas(game, e);
      const def = TRIGGER_DEFS[resolved.type];
      return def.check(resolved, context);
    });
  }
}