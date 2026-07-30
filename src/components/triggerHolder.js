import { meetsRequirements } from "../game/requirements.js";
import { applyEffect } from "../game/effects.js";
import { resolveFormulas } from "../structures/formulaDefs.js";
import { withContext } from "../utils/context.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { TRIGGER_DEFS } from "../structures/triggerDefs.js";

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

  // Returns true if any trigger fired
  fire(game, triggerType, context, strength = 1) {
    let result = false;
    for (const t of this.triggerDefs) {
      if (t.event.type !== triggerType) continue;

      const res = withContext(context, () => {
        if (!this._matches(game, t.event, context)) return false;
        if (!meetsRequirements(game, t)) return false;
        for (const effect of t.effects) applyEffect(game, effect, strength);
        return true;
      });
      if (res) result = true;
    }
    return result;
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