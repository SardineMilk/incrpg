import { EFFECT_DEFS } from "../structures/effectDefs.js";
import { processTrigger } from "./events.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { resolveFormulas } from "../structures/formulaDefs.js";


function resolve(game, val) {
  return typeof val === "function" ? val(game) : val;
}


export function applyEffect(game, effect) {

  const targets = resolveTargets(game, effect);

  for (const target of targets) {
    const e = resolveFormulas(game, target);
    const def = EFFECT_DEFS[e.type];

    if (!def) {
      console.warn("Unknown effect type:", e.type);
      return;
    }

    const result = def.apply(game, e);

    if (result) {
      const type = typeof result === "string" ? result : result.type;
      const context = typeof result === "string" ? e : (result.context ?? e);
      processTrigger(game, type, context);
  }
  }

}

export function changeEffectStrength(game, effect, multiplier) {
  const def = EFFECT_DEFS[effect.type];
  if (def?.scale) return def.scale(game, effect, multiplier);
  return effect;
}

export function applyScaledEffect(game, effect, strength) {
  applyEffect(game, changeEffectStrength(game, effect, strength));
}
