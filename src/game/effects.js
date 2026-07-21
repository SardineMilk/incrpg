import { EFFECT_DEFS } from "../structures/effectDefs.js";
import { processModifier, processTrigger } from "./events.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { resolveFormulas } from "../structures/formulaDefs.js";
import { tagsOf } from "../utils/tagIndex.js";


function resolveEffect(game, effect, strength = 1) {
  const scaledEffect = strength === 1
    ? effect
    : changeEffectStrength(game, effect, strength);

  const targets = resolveTargets(game, scaledEffect);
  return targets.map(target => resolveFormulas(game, target));
}

function changeEffectStrength(game, effect, multiplier) {
  const def = EFFECT_DEFS[effect.type];
  if (def?.scale) return def.scale(game, effect, multiplier);
  return effect;
}

// Internal: apply one pre-resolved effect object and fire its trigger.
function applyResolved(game, e) {
  const def = EFFECT_DEFS[e.type];

  processModifier(game, e.type, e);

  const result = def.apply(game, e);

  const resultType = result || e.type;
  processTrigger(game, resultType, e);
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
    console.warn(`Effect '${resolved}' has no remove(), this shouldn't be a passive effect`);
    return;
  }

  def.remove(game, resolved);
}

