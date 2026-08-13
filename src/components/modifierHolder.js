import { resolveTargets } from "../structures/selectorDefs.js";
import { resolveFormulas } from "../structures/formulaDefs.js";
import { TRIGGER_DEFS } from "../structures/triggerDefs.js";
import { MODIFIER_DEFS } from "../structures/modifierDefs.js";
import { meetsRequirements } from "../game/requirements.js";

export class ModifierHolder {
    constructor(modifierDefs = []) { this.modifierDefs = modifierDefs; }

    static fromDefinition(def) { return new ModifierHolder(def.modifiers); }
    static appliesTo(def) { return (def.modifiers?.length ?? 0) > 0; }

    collect(game, resolved) {
    const applicable = [];
    for (const m of this.modifierDefs) {
        if (m.event.type !== resolved.type) continue;
        if (!this._matches(game, m.event, resolved)) continue;
        if (!meetsRequirements(game, m)) continue; // reads via context, same as trigger reqs
        applicable.push(...m.modify);
    }
    return applicable;
    }

    _matches(game, event, context) {
        const expanded = resolveTargets(game, event);
        return expanded.some((e) => {
            const resolved = resolveFormulas(game, e);
            const def = TRIGGER_DEFS[resolved.type];
            return def.check(resolved, context);
        });
    }
}

export function applyModifiers(game, resolved) {
  let current = resolved;
  for (const id of game.active.view("ModifierHolder")) {
    const holder = game.registry.get(id, "ModifierHolder");
    const ops = game.context.with(current, () => holder.collect(game, current), `modifier:${id}`);
    for (const rawOp of ops) {
      current = game.context.with(current, () => {
        const op = resolveFormulas(game, rawOp);
        return MODIFIER_DEFS[op.type].apply(current, op);
      }, `modifier-op:${id}`);
    }
  }
  return current;
}