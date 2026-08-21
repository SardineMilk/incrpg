import { WIDGET_DEFS } from "./widgetDefs.js";
import { meetsRequirements } from "../game/requirements.js";
import { getTooltipLayer } from "./tooltipLayer.js";

const TOOLTIP_SHOW_DELAY = 400;

/*
* TODO
* Reordering support for lists
* Automatic placement for tooltips
* Keyboard support
*
*/
export class Widget {
  constructor(descriptor, game, id = null) {
    // TODO - clean up this tangled mess

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
    const def = WIDGET_DEFS[type] ?? {};

    this.el = document.createElement(def.tag ?? "div");
    this.el.className = ["ui-" + type, this.descriptor.className].filter(Boolean).join(" ");
    this.parent.appendChild(this.el);

    const env = { game: this.game, id: this.id };
    def.mount?.(this.el, this.descriptor, env);

    if (this.descriptor.tooltip) this._wireTooltip(this.descriptor.tooltip, env);

    // TODO - stupid, this should be defined in widgetDefs?
    if (type === "list") { this._setupList(); return; }
    if (type === "group") { this._setupGroup(); return; }
    if (type === "custom") { this._setupCustom(env); return; }

    this._reconcileContent(def, env);
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

  _reconcileContent(def, env) {
    const game = this.game;
    const { result: value, deps } = game.reactor.track(() => def.read(env, this.descriptor));

    if (this._contentSub) game.reactor.resubscribe(this._contentSub, deps);
    else if (deps.size > 0) {
      this._contentSub = game.reactor.subscribe(deps, () => this._reconcileContent(def, env));
    }

    const changed = !this._hasValue || (def.diff ? def.diff(this._lastValue, value) : this._lastValue !== value);
    if (changed) {
      this._lastValue = value;
      this._hasValue = true;
      def.patch?.(this.el, value, this.descriptor, env);
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

  _positionTooltip(el, spec) {
    const rect = this.el.getBoundingClientRect();
    const margin = 8;
    const below = spec.placement === "below";

    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = below ? `${rect.bottom + margin}px` : `${rect.top - margin}px`;
    el.style.transform = below ? "translate(-50%, 0)" : "translate(-50%, -100%)";
  }
}