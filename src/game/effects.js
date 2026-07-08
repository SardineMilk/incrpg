import { EFFECT_DEFS } from "../structures/effectDefs.js";
import { processTrigger } from "./events.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { resolveFormulas } from "../structures/formulaDefs.js";

// Internal: apply one pre-resolved effect object and fire its trigger.
function applyResolved(game, resolved) {
  const def = EFFECT_DEFS[resolved.type];
  const result = def.apply(game, resolved);
  if (!result) return;

  const type = result || resolved.type;
  const context = resolved;
  processTrigger(game, type, context);
}

function changeEffectStrength(game, effect, multiplier) {
  const def = EFFECT_DEFS[effect.type];
  if (def?.scale) return def.scale(game, effect, multiplier);
  return effect;
}

/* 
* Apply an effect: 
* Resolves targets + formulas, scales if required,
* fires any triggers,
* returns the resolved effects
* - this can be tracked and used to remove later
*/
export function applyEffect(game, effect, strength = 1) {
  const scaledEffect = strength === 1
    ? effect
    : changeEffectStrength(game, effect, strength);

  const targets = resolveTargets(game, scaledEffect);
  const applied = [];

  for (const target of targets) {
    const resolved = resolveFormulas(game, target);
    applyResolved(game, resolved);
    applied.push(resolved);
  }

  return applied;
}

// Undo a previously-tracked resolved effect using its def.remove method.
// Must be called with the exact object returned by applyEffect.
export function removeEffect(game, resolved) {
  const def = EFFECT_DEFS[resolved.type];
  if (!def.remove) {
    console.warn(`Effect '${resolved.type}' has no remove(), this shouldn't be a passive effect`);
    return;
  }

  def.remove(game, resolved);
}