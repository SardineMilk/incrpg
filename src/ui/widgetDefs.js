import { applyEffect } from "../game/effects.js";


export function resolveDynamic(env, val) {
  if (typeof val !== "function") return val;
  return val.length >= 2 ? val(env.game, env.id) : val(env.game);
}

export const WIDGET_DEFS = {
  text: {
    create: (content, opts = {}) => ({ type: "text", content, ...opts }),
    read: (env, w) => resolveDynamic(env, w.content),
    patch(el, value, w) {
      el.textContent = w.format ? w.format(value) : String(value ?? "");
    },
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
    mount(el) {
      el.innerHTML =
        `<div class="ui-bar-label"></div>` +
        `<div class="ui-bar-track"><div class="ui-bar-fill"></div></div>`;
    },
    patch(el, value, w, env) {
      const { current, max } = value;
      const min = Number.isFinite(value.min) ? value.min : 0;

      const range = max - min;
      const pct = Number.isFinite(max) && range > 0
        ? Math.min(100, Math.max(0, ((current - min) / range) * 100))
        : 0;

      const label = resolveDynamic(env, w.label);
      const maxLabel = Number.isFinite(max) ? Math.round(max) : "\u221e";
      el.querySelector(".ui-bar-label").textContent = label != null
        ? `${label}: ${Math.round(current)}/${maxLabel}`
        : `${Math.round(current)}/${maxLabel}`;
      el.querySelector(".ui-bar-fill").style.width = `${pct}%`;
    },
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
    tag: "button",
    mount(el, w, env) {
      el.type = "button";
      el.addEventListener("click", () => {
        const { game, id } = env;
        const effects = typeof w.effects === "function" ? w.effects(game, id) : w.effects;
        if (!effects || effects.length === 0) return;
        game.candidateScope.with({ id }, () => {
          for (const effect of effects) applyEffect(game, effect);
        });
      });
    },
    patch(el, value) {
      el.textContent = value.label;
      el.disabled = value.disabled;
      el.classList.toggle("active-action", value.active);
    },
  },

  // source: selector | (game) => id[]     
  //  item: (id) => widget descriptor
  list: {
    create: (source, item, opts = {}) => ({ type: "list", source, item, ...opts }),
  },

  // children: widget descriptor[]
  group: {
    create: (children, opts = {}) => ({ type: "group", children, ...opts }),
    mount(el, w) {
      if (w.layout) el.classList.add(`ui-group-${w.layout}`);
    },
  },

  // mount: (el, game, id) => (cleanup fn | void)
  custom: {
    create: (mount, opts = {}) => ({ type: "custom", mount, ...opts }),
  },
};

export const ui = Object.fromEntries(
  Object.entries(WIDGET_DEFS).map(([key, def]) => [key, def.create]),
);