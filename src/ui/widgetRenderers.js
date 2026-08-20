import { applyEffect } from "../game/effects.js";
import { resolveDynamic } from "../structures/widgetDefs.js";

// TODO - renderers shouldnt be separate from defs
export const RENDERERS = {
  text: {
    patch(el, value, w) {
      el.textContent = w.format ? w.format(value) : String(value ?? "");
    },
  },

  bar: {
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

  group: {
    mount(el, w) {
      if (w.layout) el.classList.add(`ui-group-${w.layout}`);
    },
  },

  list: {},
  custom: {},
};