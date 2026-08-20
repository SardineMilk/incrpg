import { WIDGET_DEFS } from "../structures/widgetDefs.js";
import { RENDERERS } from "./widgetRenderers.js";
import { meetsRequirements } from "../game/requirements.js";
import { getTooltipLayer } from "./tooltipLayer.js";

const TOOLTIP_SHOW_DELAY = 400;

/*
 * Widget is the DOM-side analogue of components/persistentEffect.js: given a
 * widget descriptor (built with ui.* in data/panelsData.js) it
 *
 *   1. reactively decides whether the widget should be *present* at all
 *      (descriptor.requirements - exactly the gate a passive effect uses),
 *      via game.reactor.track()/subscribe(), and
 *   2. reactively recomputes whatever the widget displays, patching the DOM
 *      only when the computed value actually changed (WIDGET_DEFS[type].diff).
 *
 * A Widget never polls - every read happens inside game.reactor.track(), and
 * the dependency set that call captures is exactly what schedules the next
 * recompute. There is no render loop anywhere in ui/ any more; tick.js no
 * longer drives the UI at all.
 *
 * `list` manages one child Widget per id currently returned by its `source`
 * (itself tracked the same way, so membership changing - e.g. an activity
 * finishing - adds/removes rows reactively too). `group` manages a fixed set
 * of children. Both just delegate to child Widgets for their own presence
 * and content tracking, so nesting list/group/leaf widgets arbitrarily
 * "just works" without list/group needing to know anything about their
 * children's internals.
 *
 * Known limitation: list children are appended in first-seen order and never
 * reordered after that. Fine for the current panels (action lists, skill
 * lists, meter lists) where membership only grows or the set is effectively
 * static - revisit with a keyed DOM-move step if an ordered/sortable list
 * shows up later (e.g. a sortable inventory).
 *
 * Any widget descriptor can also carry `tooltip: { content, delay, placement }`.
 * This is handled once, generically, right here in Widget - not per widget
 * type - so it works uniformly whether it's attached to a button, a bar, a
 * whole group/row, or a single stat. `content` is itself a widget descriptor
 * (or a `(game, id) => descriptor` factory), mounted on hover into a shared,
 * always-on-top floating layer (ui/tooltipLayer.js) using the exact same
 * Widget machinery as everything else - so tooltip content is fully
 * reactive for free (e.g. a skill's tooltip can show live xp), and gets the
 * same leak-safe teardown on mouseleave (or on the anchor itself
 * disappearing mid-hover) as any other widget, no bespoke cleanup needed.
 *
 * Deliberately minimal: show-delay only (hides immediately on mouseleave,
 * no separate hide-delay), and a manual `placement: "above" | "below"`
 * instead of automatic viewport-edge detection. Extend if a panel actually
 * needs more than that - simple defaults everywhere else, an escape hatch
 * only where something concretely needs it.
 *
 * Known limitation: hover-only. There's no keyboard (focus/blur) or touch
 * equivalent yet - real gaps for accessibility/mobile worth closing before
 * this is the *only* way to see certain info, not a reason to avoid hover
 * tooltips as the primary desktop interaction.
 */
export class Widget {
  constructor(descriptor, game, id = null) {
    this.descriptor = descriptor;
    this.game = game;
    this.id = id; // current list-row id, if any - available to read() as env.id

    this.el = null;
    this.parent = null;

    this._presenceSub = null;
    this._contentSub = null;
    this._membersSub = null;

    this._present = false;
    this._hasValue = false;
    this._lastValue = undefined;

    this._children = new Map(); // list: id -> Widget | group: index -> Widget
    this._cleanupCustom = null;

    this._tooltipWidget = null;
    this._tooltipShowTimer = null;
  }

  mount(parent) {
    this.parent = parent;
    this._reconcilePresence();
  }

  destroy() {
    if (this._presenceSub) {
      this.game.reactor.unsubscribe(this._presenceSub);
      this._presenceSub = null;
    }
    if (this._present) {
      this._present = false;
      this._teardown();
    }
  }

  _reconcilePresence() {
    const game = this.game;
    const { result: shouldBePresent, deps } = game.reactor.track(() =>
      meetsRequirements(game, { requirements: this.descriptor.requirements }));

    if (this._presenceSub) game.reactor.resubscribe(this._presenceSub, deps);
    else if (deps.size > 0) this._presenceSub = game.reactor.subscribe(deps, () => this._reconcilePresence());

    if (shouldBePresent && !this._present) {
      this._present = true;
      this._setup();
    } else if (!shouldBePresent && this._present) {
      this._present = false;
      this._teardown();
    }
  }

  _setup() {
    const type = this.descriptor.type;
    const renderer = RENDERERS[type] ?? {};

    this.el = document.createElement(renderer.tag ?? "div");
    this.el.className = ["ui-" + type, this.descriptor.className].filter(Boolean).join(" ");
    this.parent.appendChild(this.el);

    const env = { game: this.game, id: this.id };
    renderer.mount?.(this.el, this.descriptor, env);

    if (this.descriptor.tooltip) this._wireTooltip(this.descriptor.tooltip, env);

    if (type === "list") { this._setupList(); return; }
    if (type === "group") { this._setupGroup(); return; }
    if (type === "custom") { this._setupCustom(env); return; }

    this._reconcileContent(WIDGET_DEFS[type], renderer, env);
  }

  _teardown() {
    if (this._contentSub) { this.game.reactor.unsubscribe(this._contentSub); this._contentSub = null; }
    if (this._membersSub) { this.game.reactor.unsubscribe(this._membersSub); this._membersSub = null; }
    if (this._cleanupCustom) { this._cleanupCustom(); this._cleanupCustom = null; }
    if (this._tooltipShowTimer) { clearTimeout(this._tooltipShowTimer); this._tooltipShowTimer = null; }
    this._hideTooltip();
    for (const child of this._children.values()) child.destroy();
    this._children.clear();
    this.el?.remove();
    this.el = null;
    this._hasValue = false;
  }

  _reconcileContent(def, renderer, env) {
    const game = this.game;
    const { result: value, deps } = game.reactor.track(() => def.read(env, this.descriptor));

    if (this._contentSub) game.reactor.resubscribe(this._contentSub, deps);
    else if (deps.size > 0) {
      this._contentSub = game.reactor.subscribe(deps, () => this._reconcileContent(def, renderer, env));
    }

    const changed = !this._hasValue || (def.diff ? def.diff(this._lastValue, value) : this._lastValue !== value);
    if (changed) {
      this._lastValue = value;
      this._hasValue = true;
      renderer.patch?.(this.el, value, this.descriptor, env);
    }
  }

  _setupGroup() {
    this.descriptor.children.forEach((childDescriptor, i) => {
      const child = new Widget(childDescriptor, this.game, this.id);
      this._children.set(i, child);
      child.mount(this.el);
    });
  }

  _setupCustom(env) {
    this._cleanupCustom = this.descriptor.mount(this.el, env.game, env.id) ?? null;
  }

  _setupList() {
    const game = this.game;
    const resolveSource = () => {
      const src = this.descriptor.source;
      return typeof src === "function" ? src(game) : src ?? [];
    };

    const reconcileMembers = () => {
      const { result: ids, deps } = game.reactor.track(resolveSource);

      if (this._membersSub) game.reactor.resubscribe(this._membersSub, deps);
      else if (deps.size > 0) this._membersSub = game.reactor.subscribe(deps, reconcileMembers);

      const seen = new Set(ids);
      for (const [rowId, child] of [...this._children]) {
        if (seen.has(rowId)) continue;
        child.destroy();
        this._children.delete(rowId);
      }
      for (const rowId of ids) {
        if (this._children.has(rowId)) continue;
        const child = new Widget(this.descriptor.item(rowId), game, rowId);
        this._children.set(rowId, child);
        child.mount(this.el);
      }
    };

    reconcileMembers();
  }

  // Plain setTimeout is deliberate here, not the Worker-backed
  // setTimeoutFix/setIntervalFix from utils/throttleFix.js - those exist to
  // keep the *game* ticking accurately while the tab is backgrounded/
  // throttled. A hover-delay timer has no such requirement: nobody is
  // hovering a backgrounded tab, so native setTimeout is simpler and correct.
  _wireTooltip(spec, env) {
    this.el.addEventListener("mouseenter", () => {
      if (this._tooltipShowTimer || this._tooltipWidget) return;
      this._tooltipShowTimer = setTimeout(() => {
        this._tooltipShowTimer = null;
        this._showTooltip(spec, env);
      }, spec.delay ?? TOOLTIP_SHOW_DELAY);
    });

    this.el.addEventListener("mouseleave", () => {
      clearTimeout(this._tooltipShowTimer);
      this._tooltipShowTimer = null;
      this._hideTooltip();
    });
  }

  _showTooltip(spec, env) {
    const descriptor = typeof spec.content === "function"
      ? spec.content(env.game, env.id)
      : spec.content;
    if (!descriptor) return;

    // Mounted as a completely ordinary Widget, straight into the shared
    // floating layer - same reactive read()/diff() cycle and the same
    // destroy()-unsubscribes-everything teardown as any panel content, no
    // separate cleanup path to get wrong. Its own root element (whatever
    // ui.* type the content descriptor is) is positioned directly - no
    // extra wrapper div.
    this._tooltipWidget = new Widget(descriptor, this.game, this.id);
    this._tooltipWidget.mount(getTooltipLayer());
    if (this._tooltipWidget.el) {
      this._tooltipWidget.el.classList.add("ui-tooltip");
      this._positionTooltip(this._tooltipWidget.el, spec);
    }
  }

  _hideTooltip() {
    this._tooltipWidget?.destroy();
    this._tooltipWidget = null;
  }

  // `position: fixed` + coordinates straight from getBoundingClientRect()
  // means no scroll-offset math, regardless of which (possibly scrolled)
  // panel the anchor lives in. Centered above the anchor by default; pass
  // `placement: "below"` for anchors near the top of the screen. No
  // automatic viewport-edge detection - add it if a panel actually needs it.
  _positionTooltip(el, spec) {
    const rect = this.el.getBoundingClientRect();
    const margin = 8;
    const below = spec.placement === "below";

    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = below ? `${rect.bottom + margin}px` : `${rect.top - margin}px`;
    el.style.transform = below ? "translate(-50%, 0)" : "translate(-50%, -100%)";
  }
}