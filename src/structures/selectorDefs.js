import { byTag, allIds } from "../utils/tagIndex.js";

// Tag selectors so resolveTargets can find them in arbitrary fields.
const SELECTOR = Symbol("selector");

function makeSelector(fn) {
  const wrapped = (game) => fn(game);
  wrapped[SELECTOR] = true;
  return wrapped;
}

export function isSelector(val) {
  return typeof val === "function" && val[SELECTOR] === true;
}

// A selector input can be a live selector OR a plain array of ids
// (e.g. the result of sel.ids(...), or a bare literal array). Both
// are valid anywhere a selector is accepted, so combinators use this.
function resolveIds(game, val) {
  return isSelector(val) ? val(game) : val;
}

function tagClause(namespace, clause) {
  const tags = Array.isArray(clause) ? clause : [clause];
  const set = new Set();
  for (const tag of tags) {
    for (const id of byTag(namespace, tag)) set.add(id);
  }
  return set;
}

function intersectSets(sets) {
  return sets.reduce((a, b) => new Set([...a].filter((x) => b.has(x))));
}

/*
 *   sel.tags("skills", "combat")                        // combat
 *   sel.tags("skills", "combat", "regen")                // combat AND regen
 *   sel.tags("skills", "combat", ["melee", "ranged"])    // combat AND (melee OR ranged)
*
 *   eff.gainSkillXp(sel.tags("skills", "physical"), 5)
 *   eff.changeConditionStrength(sel.conditions.tags("passive_regen"), {flat: -0.5})
 *   eff.changeValue(sel.ids("health", "stamina"), -10)
 *
 *   // every disease that ISN'T currently active
 *   sel.where(
 *     sel.conditions.not(sel.conditions.tags("cured")),
 *     (game, id) => !game.registry.get(id, "ActiveHolder").active
 *   )
 *
 *   // union across two unrelated tag groups
 *   sel.union(sel.conditions.tags("weather"), sel.conditions.tags("terrain"))
 */
export const sel = {
  // Flattened, so an array and multipler parameters are identical
  ids: (...ids) => makeSelector(() => ids.flat()),

  tags: (namespace, ...clauses) =>
    makeSelector(() => {
      if (clauses.length === 0) return allIds(namespace);
      return [...intersectSets(clauses.map((c) => tagClause(namespace, c)))];
    }),

  // Every id registered in a namespace, tagged or not.
  all: (namespace) => makeSelector(() => allIds(namespace)),

  // Everything in `namespace` NOT produced by `selector`.
  not: (namespace, selector) =>
    makeSelector((game) => {
      const exclude = new Set(resolveIds(game, selector));
      return allIds(namespace).filter((id) => !exclude.has(id));
    }),

  union: (...selectors) =>
    makeSelector((game) => {
      const set = new Set();
      for (const s of selectors) {
        for (const id of resolveIds(game, s)) set.add(id);
      }
      return [...set];
    }),

  intersect: (...selectors) =>
    makeSelector((game) => {
      const sets = selectors.map((s) => new Set(resolveIds(game, s)));
      return [...intersectSets(sets)];
    }),

  // Escape hatch, used for dynamic runtime selections 
  where: (selector, requirements) =>
    makeSelector((game) =>
      resolveIds(game, selector).filter((id) =>
        withContext({ id: id }, () =>
          meetsRequirements(game, { requirements })
        )
      )
    ),

};

// Namespace sugar to make selectors more readable
// sel.conditions.tags(...) is just sel.tags("conditions", ...).
for (const namespace of ["conditions", "skills", "locations", "actions"]) {
  sel[namespace] = {
    tags: (...clauses) => sel.tags(namespace, ...clauses),
    all: () => sel.all(namespace),
    not: (selector) => sel.not(namespace, selector),
  };
}

/*
 * Expand every selector field on a structure into concrete structures.
 *
 * A structure can have more than one selector field 
 * - this returns the cartesian product. Should this be different?
 * With zero selector fields the structure is returned unchanged.
 */
export function resolveTargets(game, structure) {
  const selectorFields = Object.entries(structure).filter(
    ([key, val]) => key !== "type" && isSelector(val)
  );

  if (selectorFields.length === 0) return [structure];

  let results = [structure];
  for (const [key, val] of selectorFields) {
    const values = val(game);
    results = results.flatMap((base) =>
      values.map((v) => ({ ...base, [key]: v }))
    );
  }
  return results;
}