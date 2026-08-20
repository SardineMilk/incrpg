import { applyEffect } from "../game/effects.js";
import { resolveDynamic } from "../structures/widgetDefs.js";

/*
 * The DOM-facing half of each widget type. structures/widgetDefs.js holds
 * the DOM-free half (create()/read()/diff()); this split means the widget
 * descriptors themselves - and the reactive read() logic that decides
 * *whether* to repaint - never touch `document`, matching the rest of
 * structures/ (which has zero DOM dependencies anywhere else either).
 *
 *   tag                  -> element type to create for this widget (default div)
 *   mount(el, w, env)    -> one-time DOM setup (e.g. wiring a click handler)
 *   patch(el, value, w, env) -> apply a new read() result to the DOM
 *
 * `list`/`custom` have no patch of their own - ui/widget.js drives their
 * children/mount function directly instead of going through read()/patch().
 */
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
      // Most meters in this engine leave `min` unset, which resolves to
      // -Infinity (see CompletionHolder._createMeter) - meaning "no lower
      // bound", not "the bar's lower bound is negative infinity". Clamp for
      // display the same way the old renderActivity.js did.
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
        // Wrapped in candidateScope so effects written with fml.candidate("id")
        // resolve against this row, exactly like list/selector expansion does
        // for data-driven effects (see selectorDefs.js's resolveTargets).
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