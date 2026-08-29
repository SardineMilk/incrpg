import { byTag } from "../utils/tagIndex.js";
import { meetsRequirements } from "../game/requirements.js";
import { resolveFormulas } from "./formulaDefs.js";

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

function tagClause(clause) {
  const tags = Array.isArray(clause) ? clause : [clause];
  const set = new Set();
  for (const tag of tags) {
    for (const id of byTag(tag)) set.add(id);
  }
  return set;
}

function intersectSets(sets) {
  return sets.reduce((a, b) => new Set([...a].filter((x) => b.has(x))));
}


export const sel = {
  // ── Set Theory ──────────────────────────────────────────────────────────────

  // Flattened, so an array and multiple parameters are identical
  ids: (...ids) => makeSelector(() => ids.flat()),

  tags: (...clauses) =>
    makeSelector(() => {
      // No clauses means nothing
      if (clauses.length === 0) return [];
      return [...intersectSets(clauses.map(tagClause))];
    }),


  // Everything in `pool` that ISN'T also in `exclude`.
  not: (pool, exclude) =>
    makeSelector((game) => {
      const excludeSet = new Set(resolveIds(game, exclude));
      return resolveIds(game, pool).filter((id) => !excludeSet.has(id));
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


  active: (...selectors) =>
    makeSelector((game) => {
      return resolveIds(game, sel.union(...selectors)).filter((id) => {
        game.reactor.read(`active:${game.id}:${id}`);  // read every matching entity, including inactive
        return game.active.isActive(id);
      });
    }),

};

/*
 * Expand every selector field on a structure into concrete structures.
 *
 * A structure can have more than one selector field
 * - this returns the cartesian product. Should this be different?
 * With zero selector fields the structure is returned unchanged.
 */

export function resolveTargets(game, structure) {
  const { requirements, ...base } = structure;
  const selectorFields = Object.entries(base).filter(
    ([key, val]) => key !== "type" && isSelector(val)
  );

  let results = [base];
  for (const [key, val] of selectorFields) {
    const values = val(game);
    results = results.flatMap((partial) =>
      values.map((v) => ({ ...partial, [key]: v }))
    );
  }

  const resolved = [];
  for (const candidate of results) {
    const outcome = game.candidateScope.with(candidate, () => {
      const r = resolveFormulas(game, candidate);
      if (requirements && !meetsRequirements(game, { requirements })) return null;
      return r;
    });
    if (outcome !== null) resolved.push(outcome);
  }
  return resolved;
}