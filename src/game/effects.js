import { EFFECT_DEFS } from "../structures/effectDefs.js";
import { processModifier, processTrigger } from "./events.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { resolveFormulas } from "../structures/formulaDefs.js";
import { tagsOf } from "../utils/tagIndex.js";

// Internal: apply one pre-resolved effect object and fire its trigger.
function applyResolved(game, e) {
  const def = EFFECT_DEFS[e.type];

  // TODO this is hardcoded, not ideal
  if (e.id != null && e.tags === undefined) e.tags = tagsOf(e.id);

  processModifier(game, e.type, e);

  const result = def.apply(game, e);

  const type = result || e.type;
  processTrigger(game, type, e);
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

// Must be called with a resolved effect (returned by applyEffect)
export function removeEffect(game, resolved) {
  const def = EFFECT_DEFS[resolved.type];
  if (!def.remove) {
    console.warn(`Effect '${resolved}' has no remove(), this shouldn't be a passive effect`);
    return;
  }

  def.remove(game, resolved);
}

export function negateEffect(game, effect) {
  const targets = resolveTargets(game, effect);
  for (const target of targets) {
    const resolved = resolveFormulas(game, target);
    removeEffect(game, resolved);
  }
}