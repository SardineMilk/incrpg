// components/modifierHolder.js
import { MODIFIER_DEFS } from "../structures/modifierDefs.js";
import { meetsRequirements } from "../game/requirements.js";
import { resolveFormulas } from "../structures/formulaDefs.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { TRIGGER_DEFS } from "../structures/triggerDefs.js";

export class ModifierHolder {
  constructor(modifierDefs = []) { this.modifierDefs = modifierDefs; }
  static fromDefinition(def) { return new ModifierHolder(def.modifiers); }
  static appliesTo(def) { return (def.modifiers?.length ?? 0) > 0; }

  collect(game, resolved) {
    const ops = [];
    for (const m of this.modifierDefs) {
      if (m.event.type !== resolved.type) continue;
      if (!this._matches(game, m.event, resolved)) continue;
      if (!meetsRequirements(game, m)) continue;
      ops.push(...m.modify);
    }
    return ops;
  }

  _matches(game, event, context) {
    const expanded = resolveTargets(game, event);
    return expanded.some((e) => {
      const r = resolveFormulas(game, e);
      return TRIGGER_DEFS[r.type].check(r, context);
    });
  }
}

function scaleOp(game, rawOp, strength) {
  if (strength === 1) return rawOp;
  const def = MODIFIER_DEFS[rawOp.type];
  return def.scale ? def.scale(game, rawOp, strength) : rawOp;
}

export function applyModifiers(game, resolved) {
  let current = resolved;

  for (const id of game.active.view("ModifierHolder")) {
    const holder = game.registry.get(id, "ModifierHolder");
    const strength = game.registry.get(id, "StatLayer")?.value ?? 1;

    const rawOps = game.context.with(current, () => holder.collect(game, current), `modifier:${id}`);

    for (const rawOp of rawOps) {
      current = game.context.with(current, () => {
        const scaled = scaleOp(game, rawOp, strength);
        const op = resolveFormulas(game, scaled);
        return MODIFIER_DEFS[op.type].apply(current, op);
      }, `modifier-op:${id}`);
    }
  }

  return current;
}