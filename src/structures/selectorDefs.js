  import { byTag } from "../utils/tagIndex.js";

// Tag selectors so resolveTargets can find them in arbitrary fields
// New effect structures have unkown field names, so hardcoding won't work
// This has the side effect of allowing literally any field to be a selector
// Fun.

const SELECTOR = Symbol("selector");
function makeSelector(fn) {
  const wrapped = (game) => fn(game);
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

    const values = val(game);
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

// TODO - allow xor operations on nested selectors

export const sel = {

  // ── Conditions ────────────────────────────────────────────────────────────

  conditionsByTag: (tag) =>
    makeSelector(() => byTag("conditions", tag)),

  // ── Skills ────────────────────────────────────────────────────────────────

  /** Ids from the SKILLS dataset that carry `tag` AND are present on the player. */
  skillsByTag: (tag) =>
    makeSelector((game) =>
      byTag("skills", tag).filter((id) => id in game.skills)
    ),

  /** All ids from the SKILLS dataset that carry `tag`. */
  allSkillsByTag: (tag) =>
    makeSelector(() => byTag("skills", tag)),

  // ── Locations ─────────────────────────────────────────────────────────────

  /** All location ids that carry `tag`. */
  locationsByTag: (tag) =>
    makeSelector(() => byTag("locations", tag)),

  // ── Escape hatches ────────────────────────────────────────────────────────

  /** Supply an array of tags directly */
  ids: (...ids) => makeSelector(() => ids.flat()),

};