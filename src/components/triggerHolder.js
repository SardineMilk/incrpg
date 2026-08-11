import { meetsRequirements } from "../game/requirements.js";
import { resolveFormulas } from "../structures/formulaDefs.js";
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

  collect(game, triggerType, context, phase) {
    const pending = [];
    for (const t of this.triggerDefs) {
      t.phase ??= "post";  // TODO - do in state_creator.js

      if (t.event.type !== triggerType) continue;
      if (t.phase !== phase) continue;
      if (!this._matches(game, t.event, context)) continue;
      if (!meetsRequirements(game, t)) continue;
      for (const effect of t.effects) pending.push(effect);
    }
    return pending;
  }

  apply(game, pending, strength) {
    for (const effect of pending) applyEffect(game, effect, strength);
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