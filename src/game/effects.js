import { EFFECT_DEFS } from "../structures/effectDefs.js";
import { processTrigger } from "./events.js";

// Injected into apply() for effects that need game-logic deps without
// creating a circular init-time dependency through conditionsData/skills.
// TODO - Fix, this is stupid
import { CONDITIONS } from "../data/conditionsData.js";
const ctx = { CONDITIONS };

function resolve(game, val) {
  return typeof val === "function" ? val(game) : val;
}

// TODO generalise and apply to other structures
function resolveFormulas(game, effect) {
  const e = { ...effect };
  for (const [key, val] of Object.entries(e)) {
    if (key !== "type") e[key] = resolve(game, val);
  }
  return e;
}

// Resolve single target or by-tag selections
function resolveTargets(game, ctx, target) {
  if (typeof target === "function") return target(game, ctx);
  if (target == null) return [];
  return [target];
}
// TODO actually implement this
export const sel = {
  /** All active conditions that carry the given tag. */
  // TODO - set effect.condition for every result?
  conditionsByTag: (tag) => (game, ctx) =>
    Object.keys(game.activeConditions).filter((id) =>
    ctx.CONDITIONS[id]?. tags?. includes(tag)
  ),
};

export function applyEffect(game, effect) {
  const e = resolveFormulas(game, effect);
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
