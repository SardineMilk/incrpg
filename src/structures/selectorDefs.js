import { CONDITIONS } from "../data/conditionsData.js";
const ctx = { CONDITIONS };

// Flow:
/* 
 * resolveTargets(game, structure):
 * exported and called by other code
 * returns a list, either
 *  [structure] or
 *  [structureA, structureB, ... ] if there is a selector function
 * 
 * If there is a selector function:
 * find the field it's in 
 *      this needs to be generalised, we can't hardcode search for field names
 *      because new structures can be added in the future, ideally they dont need to 
 *      know about how selectors work 
 * then generate the array of matching structures
 */

// TODO actually implement this - current implementation is placeholder



// Resolve single target or by-tag selections
export function resolveTargets(game, target) {
  if (typeof target === "function") return target(game, ctx);
  if (target == null) return [];
  return [target];
}


const sel = {
  /** All active conditions that carry the given tag. */
  // TODO - set effect.condition for every result?
  conditionsByTag: (tag) => (game, ctx) =>
    Object.keys(game.activeConditions).filter((id) =>
    ctx.CONDITIONS[id]?. tags?. includes(tag)
  ),
};