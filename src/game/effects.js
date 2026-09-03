import { EFFECT_DEFS } from "../structures/effectDefs.js";
import { processTrigger } from "./events.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { resolveFormulas } from "../structures/formulaDefs.js";
import { tagsOf } from "../utils/tagIndex.js";
import { applyModifiers } from "../components/modifierHolder.js";


// Resolves an effect's targets + formulas, scaling by strength if required.
// Exported (was private) - the reactive passive reconciler needs to re-run
// this same resolution step on demand, outside of a full applyEffect().
export function resolveEffect(game, effect, strength = 1) {
  const scaledEffect = strength === 1 ? effect : changeEffectStrength(game, effect, strength);

  const targets = resolveTargets(game, scaledEffect);
  return targets.map(target => {
    const resolved = resolveFormulas(game, target)
    return applyModifiers(game, resolved)
  });

  }

function changeEffectStrength(game, effect, multiplier) {
  const def = EFFECT_DEFS[effect.type];
  if (def?.scale) return def.scale(game, effect, multiplier);
  return effect;
}

// Apply one pre-resolved effect object and fire its trigger.
// Exported (was private) - the reactive passive reconciler applies
// individual resolved effects (and diffs) directly, without re-resolving
// through applyEffect() each time.
export function applyResolved(game, e) {
  const def = EFFECT_DEFS[e.type];

  // TODO - replace with a standard trigger type
  processTrigger(game, e.type, e, "pre");
  if (e.cancelled) return; // Cancels *after* all pre-triggers have executed

  const result = def.apply(game, e);

  const resultType = result || e.type;  // TODO - additive not replacing
  processTrigger(game, resultType, e, "post");
}

/* 
* Apply an effect: 
* Resolves targets + formulas, scales if required,
* fires any triggers,
* returns the resolved effects
* - this can be tracked and used to remove later
*/
export function applyEffect(game, effect, strength = 1) {
  const resolvedEffects = resolveEffect(game, effect, strength);

  for (const resolved of resolvedEffects) {
    applyResolved(game, resolved);
  }

  return resolvedEffects;
}

export function negateEffect(game, effect) {
  const resolvedEffects = resolveEffect(game, effect);

  for (const resolved of resolvedEffects) {
    removeEffect(game, resolved);
  }
}


// Must be called with a resolved effect (returned by applyEffect)
export function removeEffect(game, resolved) {
  const def = EFFECT_DEFS[resolved.type];
  if (!def.remove) {
    console.warn(`Effect '${resolved.type}' has no remove(), this probably shouldn't be a passive effect`);
    return;
  }

  def.remove(game, resolved);
}

// Finds the smallest change to move an effect state from prev to next
// Example:
// eff.changeValue(), previously resolved to 1, now resolves to 10
// returns change of 9
export function diffEffect(prevResolved, nextResolved) {
  const def = EFFECT_DEFS[nextResolved.type];
  if (!def.diff) return undefined;
  return def.diff(prevResolved, nextResolved);
}

// True if this effect type declares a remove()
// Iff, then it's safe for PassiveHolder
export function isReversible(effectType) {
  return !!EFFECT_DEFS[effectType]?.remove;
}