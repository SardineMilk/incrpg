import { CONDITIONS } from "../data/conditionsData.js";
import { SKILLS } from "../data/skillsData.js";
import { LOCATIONS } from "../data/locationsData.js";
const _CTX = { CONDITIONS, SKILLS, LOCATIONS };


// Tag selectors so resolveTargets can find them in arbitrary fields
// New effect structures have unkown field names, so hardcoding won't work
// This has the side effect of allowing literally any field to be a selector
// Fun.

const SELECTOR = Symbol("selector");
function makeSelector(fn) {
  const wrapped = (game, ctx) => fn(game, ctx);
  wrapped[SELECTOR] = true;
  return wrapped;
}

export function isSelector(val) {
  return typeof val === "function" && val[SELECTOR] === true;
}

// Resolve single target or by-tag selections
export function resolveTargets(game, structure) {
  for (const [key, val] of Object.entries(structure)) {
    if (key === "type") continue;
    if (!isSelector(val)) continue;

    const values = val(game, _CTX);
    return values.map((v) => ({ ...structure, [key]: v }));
  }
  return [structure];
}

/*
 * Examples:
 *   eff.grantSkillXp(sel.skillsByTag("physical"), 5)
 *   eff.changeConditionStrength(sel.conditionsByTag("passive_regen"), -0.5)
 *   eff.changeResource(sel.ids(["health", "stamina"]), -10)
 *   
 *   // Has every disease ever. 
 *   // Refer to requirement rules for how to define "has any disease"  
 *   req.hasCondition(sel.allConditionsByTag("disease")) 
 * 
 * Techincally valid: 
 *   // sets location to every "town" in LOCATIONS in order of definition
 *   eff.setLocation(sel.locationsByTag("town"))  
 */

export const sel = {
  // ── Conditions ──────────────────────────────────────────────────────────────

  /** All active conditions that carry the given tag. */
  conditionsByTag: (tag) =>
    makeSelector((game, { CONDITIONS }) =>
      Object.keys(game.activeConditions).filter((id) =>
        CONDITIONS[id]?.tags?.includes(tag)
      )
    ),

  /** Every condition that exists in the data (active or not). */
  allConditionsByTag: (tag) =>
    makeSelector((_game, { CONDITIONS }) =>
      Object.keys(CONDITIONS).filter((id) =>
        CONDITIONS[id]?.tags?.includes(tag)
      )
    ),

  // ── Skills ──────────────────────────────────────────────────────────────────

  /** All skills the player currently has (from game.skills) with a given tag. */
  skillsByTag: (tag) =>
    makeSelector((game, { SKILLS }) =>
      Object.keys(game.skills).filter((id) => SKILLS[id]?.tags?.includes(tag))
    ),

  /** All skills defined in SKILLS data with a given tag. */
  allSkillsByTag: (tag) =>
    makeSelector((_game, { SKILLS }) =>
      Object.keys(SKILLS).filter((id) => SKILLS[id]?.tags?.includes(tag))
    ),

  // ── Locations ───────────────────────────────────────────────────────────────

  /** All locations in the data that carry the given tag. */
  locationsByTag: (tag) =>
    makeSelector((_game, { LOCATIONS }) =>
      Object.keys(LOCATIONS).filter((id) =>
        LOCATIONS[id]?.tags?.includes(tag)
      )
    ),

  // ── Other ───────────────────────────────────────────────────────────────────


  /** Supply a raw array of Id's directly */
  ids: (...ids) => makeSelector(() => ids.flat()),


};