import { REQUIREMENT_DEFS } from "../structures/requirementDefs.js";

function meetsRequirement(game, requirement) {
  const def = REQUIREMENT_DEFS[requirement.type];
  if (!def) {
    console.warn("Unknown requirement type:", requirement.type);
    return false;
  }
  return def.check(game, requirement);
}

function meetsRequirementsGroup(game, group) {
  return group.some((r) => meetsRequirement(game, r));
}

export function meetsRequirements(game, thing) {
  const reqs = thing.requirements;
  if (!reqs || reqs.length === 0) return true;

  // [[A, B], [C, D]] -> (A || B) && (C || D)
  if (Array.isArray(reqs[0])) {
    return reqs.every((group) => meetsRequirementsGroup(game, group));
  }

  // [A, B, C] -> A && B && C
  return reqs.every((r) => meetsRequirement(game, r));
}
