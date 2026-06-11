import { EFFECT_DEFS } from "../data/effectDefs.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { grantSkillXp } from "./skills.js";
import { processTrigger } from "./events.js";

// Injected into apply() for effects that need game-logic deps without
// creating a circular init-time dependency through conditionsData/skills.
const ctx = { grantSkillXp, CONDITIONS };

function resolve(game, val) {
  return typeof val === "function" ? val(game) : val;
}

function resolveEffect(game, effect) {
  const e = { ...effect };
  for (const [key, val] of Object.entries(e)) {
    if (key !== "type") e[key] = resolve(game, val);
  }
  return e;
}

export function applyEffect(game, effect) {
  const e = resolveEffect(game, effect);
  const def = EFFECT_DEFS[e.type];

  if (!def) {
    console.warn("Unknown effect type:", e.type);
    return;
  }

  const result = def.apply(game, e, ctx);

  if (result) {
    const type = typeof result === "string" ? result : result.type;
    const context = typeof result === "string" ? e : (result.context ?? e);
    processTrigger(game, type, context);
  }
}

export function changeEffectStrength(game, effect, multiplier) {
  const def = EFFECT_DEFS[effect.type];
  if (def?.scale) return def.scale(game, effect, multiplier);
  console.warn("Cannot scale effect:", effect.type);
  return effect;
}

export function applyScaledEffect(game, effect, strength) {
  applyEffect(game, changeEffectStrength(game, effect, strength));
}
