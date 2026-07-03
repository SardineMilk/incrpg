import { EFFECT_DEFS } from "../structures/effectDefs.js";
import { processTrigger } from "./events.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { resolveFormulas } from "../structures/formulaDefs.js";


// Internal: apply one pre-resolved effect object and fire its trigger.
function applyResolved(game, resolved) {
  const def = EFFECT_DEFS[resolved.type];
  if (!def) {
    console.warn("Unknown effect type:", resolved.type);
    return;
  }
  const result = def.apply(game, resolved);
  if (!result) return;
  const type    = typeof result === "string" ? result   : result.type;
  const context = typeof result === "string" ? resolved : (result.context ?? resolved);
  processTrigger(game, type, context);
}

// Apply an effect — resolves targets + formulas, fires triggers. Fire-and-forget.
export function applyEffect(game, effect) {
  const targets = resolveTargets(game, effect);
  for (const target of targets) {
    applyResolved(game, resolveFormulas(game, target));
  }
}

// Like applyEffect, but returns every resolved effect object that was applied.
// This is used to store resolved effects for removal later
export function applyEffectTracked(game, effect) {
  const targets = resolveTargets(game, effect);
  const applied = [];
  for (const target of targets) {
    const resolved = resolveFormulas(game, target);
    applyResolved(game, resolved);
    applied.push(resolved);
  }
  return applied;
}

// Undo a previously-tracked resolved effect using its def.remove method.
// Must be called with the exact object returned by applyEffectTracked.
export function removeEffect(game, resolved) {
  const def = EFFECT_DEFS[resolved.type];
  if (!def) {
    console.warn("Unknown effect type:", resolved.type);
    return;
  }
  if (!def.remove) {
    console.warn(`Effect '${resolved.type}' has no remove() — cannot undo.`);
    return;
  }
  def.remove(game, resolved);
}

export function changeEffectStrength(game, effect, multiplier) {
  const def = EFFECT_DEFS[effect.type];
  if (def?.scale) return def.scale(game, effect, multiplier);
  return effect;
}

export function applyScaledEffect(game, effect, strength) {
  applyEffect(game, changeEffectStrength(game, effect, strength));
}