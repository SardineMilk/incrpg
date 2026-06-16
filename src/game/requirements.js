import { REQUIREMENT_DEFS } from "../structures/requirementDefs.js";
import { resolveTargets } from "../structures/selectorDefs.js";
import { resolveFormulas } from "../structures/formulaDefs.js";


function expandLevel(game, arr) {
  return arr.flatMap((item) => {
    if (Array.isArray(item)) return [expandLevel(game, item)]; 
    return resolveTargets(game, item);          
  });               
}

function meetsRequirement(game, requirement) {
  const r = resolveFormulas(game, requirement);
  const def = REQUIREMENT_DEFS[r.type];
  if (!def) {
    console.warn("Unknown requirement type:", r.type);
    return false;
  }
  return def.check(game, r);
}

export function meetsRequirements(game, structure) {
  const reqs = structure.requirements;
  if (!reqs || reqs.length === 0) return true;

  // Expand all selectors at every level before evaluating.
  const expanded = expandLevel(game, reqs);

  // Outer level is always AND
  // Array items are OR groups
  return expanded.every((item) =>
    Array.isArray(item)
      ? item.some((r) => meetsRequirement(game, r))
      : meetsRequirement(game, item)
  );
}