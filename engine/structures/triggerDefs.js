import { resolveTargets, resolveFormulas } from "./formulaDefs.js";

/*
 * Event types come from two places:
 *   1. Every applied effect fires <effect.type> in "pre" and "post" automatically.
 *   2. Anything else is fired from code: game.events.emit(type, payload, phase).
 * Only events that have an entry here can be listened to.
 * 
 * `match` is used to add requirements to any Trigger that must be met by the Payload
 * `key` is a syntactic wrapper to make trivial `p.foo == t.foo` matches easier to write
 * 
 */
export const TRIGGER_DEFS = {
  // Effect lifecycle events - fired automatically by applyResolved
  activate: {
    create: (id = null) => ({ type: "activate", id }),
    key: "id"
  },
  changeValue: {
    create: (id = null) => ({ type: "changeValue", id }),
    key: "id",
  },
  gainXp: {
    create: (id) => ({ type: "gainXp", id }),
    key: "id",
    match: (t, p) => !!p.id && p.amount >= 0,
  },
  progress: {
    create: (meter = "progress") => ({ type: "progress", meter }),
    key: "meter",
  },
  despawn: {
    create: () => ({ type: "despawn" }),
  },

  // Semantic events (emitted explicitly)
  tick: {
    create: () => ({ type: "tick" }),
    display: () => "On tick",
  },
  onTrigger: {
    create: (id) => ({ type: "onTrigger", id }),
    key: "id",
  },
  onActivate: {
    create: (id) => ({ type: "onActivate", id }),
    key: "id",
  },
  onDeactivate: {
    create: (id) => ({ type: "onDeactivate", id }),
    key: "id",
  },
  valueGain: {
    create: (id = null, min = 1) => ({ type: "valueGain", id, min }),
    key: "id",
    match: (t, p) => p.amount >= t.min,
  },
  valueLoss: {
    create: (id = null, min = 1) => ({ type: "valueLoss", id, min }),
    key: "id",
    match: (t, p) => p.amount <= -t.min,
  },
  strengthChanged: {
    create: (id = null) => ({ type: "strengthChanged", id }),
    key: "id",
  },
  durationExpired: {
    create: (id) => ({ type: "durationExpired", id }),
    key: "id",
  },
  levelUp: {
    create: (id) => ({ type: "levelUp", id }),
    key: "id",
  },
  levelDown: {
    create: (id) => ({ type: "levelDown", id }),
    key: "id",
  },
  delivered: {
    create: () => ({ type: "delivered" }),
    display: () => "On an effect you delivered landing",
  },
  error: {
    create: (err) => ({type: "error", err}),
    display: () => "When this actor causes an error",
  }
};

export const evt = Object.fromEntries(
  Object.entries(TRIGGER_DEFS).map(([key, def]) => [key, def.create]),
);

// Rule compilation
// Runs once per definition, not actor (holders are shared by every actor).
// Output: { type, phase, match(game, payload), requirements, effects, modify }

const PHASES = new Set(["pre", "post", "modify"]);

export function compileRule(def, defaultPhase, where = "?") {
  const { event } = def;
  const eventDef = TRIGGER_DEFS[event?.type];
  if (!eventDef) throw new Error(`${where}: unknown event type "${event?.type}"`);

  const phase = def.phase ?? defaultPhase;
  if (!PHASES.has(phase)) throw new Error(`${where}: unknown phase "${phase}"`);

  // Does this payload satisfy the resolved trigger;s requirements?
  // check key here, then match()
  const { key, match } = eventDef;
  const accepts = (ev, p) =>
    (key == null || ev[key] == null || ev[key] === p[key]) && (!match || match(ev, p));

  // Does this trigger have requirements dependent on live state? 
  // If it has any formulas, assume yes
  const dynamic = Object.values(event).some((v) => typeof v === "function");

  return {
    type: event.type,
    phase,
    match: dynamic
      ? (game, p) => resolveTargets(game, event).some((e) => accepts(resolveFormulas(game, e), p))
      : (_game, p) => accepts(event, p),
    requirements: def.requirements ?? null,
    effects: def.effects ?? [],
    modify: def.modify ?? [],
  };
}