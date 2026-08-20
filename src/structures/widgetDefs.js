/*
 * Each entry defines one widget type, used as ui.foo() in a panel data file
 * (data/panelsData.js) - the UI equivalent of eff.foo()/req.foo()/evt.foo().
 *
 *   create(...args) -> widget descriptor plain-object
 *   read(env, w)     -> the value this widget currently displays. Called by
 *                       ui/widget.js inside game.reactor.track(), so every
 *                       game-state read inside it becomes a dependency - the
 *                       widget repaints exactly when (and only when) one of
 *                       those dependencies changes. No polling, anywhere.
 *   diff(prev, next) -> optional. Skip the DOM patch if this returns false.
 *                       Defaults to `prev !== next`.
 *
 * `list` and `group` don't display a single value - they manage child
 * widgets instead (dynamic per-id children for `list`, a fixed set for
 * `group`), so they have no read()/diff(). `custom` hands its DOM node to
 * arbitrary code and opts out of the reactive model entirely - an escape
 * hatch for widgets (the event log, with its own virtualised scrolling) that
 * are fundamentally not "one value in, DOM out". See ui/widget.js for how
 * all of this is actually wired together.
 *
 * Any widget descriptor can carry `requirements` (same shape as everywhere
 * else in the engine - see requirementDefs.js). A widget whose requirements
 * aren't currently met simply isn't mounted, exactly like a passive effect
 * that isn't currently present - and like a passive effect, that check is
 * itself tracked, so the widget appears/disappears reactively too.
 *
 * `content` / `current` / `max` / `min` / `label` / `disabled` / `active` /
 * `effects` fields all accept either a static value, or a function:
 *   (game) => value      - identical shape to an fml.* formula, so any
 *                           fml.foo(...) can be dropped straight in.
 *   (game, id) => value  - the two-argument form additionally receives the
 *                           widget's current row id, when it's used as a
 *                           `list` item template (see resolveDynamic below).
 */

export function resolveDynamic(env, val) {
  if (typeof val !== "function") return val;
  return val.length >= 2 ? val(env.game, env.id) : val(env.game);
}

export const WIDGET_DEFS = {
  text: {
    create: (content, opts = {}) => ({ type: "text", content, ...opts }),
    read: (env, w) => resolveDynamic(env, w.content),
  },

  bar: {
    create: (current, max, opts = {}) => ({ type: "bar", current, max, min: 0, ...opts }),
    read: (env, w) => ({
      current: resolveDynamic(env, w.current),
      max: resolveDynamic(env, w.max),
      min: resolveDynamic(env, w.min),
    }),
    diff: (prev, next) =>
      !prev || prev.current !== next.current || prev.max !== next.max || prev.min !== next.min,
  },

  button: {
    create: (label, effects, opts = {}) => ({ type: "button", label, effects, ...opts }),
    read: (env, w) => ({
      label: resolveDynamic(env, w.label),
      disabled: w.disabled ? !!resolveDynamic(env, w.disabled) : false,
      active: w.active ? !!resolveDynamic(env, w.active) : false,
    }),
    diff: (prev, next) =>
      !prev ||
      prev.label !== next.label ||
      prev.disabled !== next.disabled ||
      prev.active !== next.active,
  },

  list: {
    create: (source, item, opts = {}) => ({ type: "list", source, item, ...opts }),
  },

  group: {
    create: (children, opts = {}) => ({ type: "group", children, ...opts }),
  },

  custom: {
    create: (mount, opts = {}) => ({ type: "custom", mount, ...opts }),
  },
};

export const ui = Object.fromEntries(
  Object.entries(WIDGET_DEFS).map(([key, def]) => [key, def.create]),
);