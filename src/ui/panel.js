import { Widget } from "./widget.js";

export class Panel {
  // meta: the panel definition, for presentation attributes (title, voice)
  constructor(id, descriptor, containerId, meta = {}) {
    this.id = id;
    this.meta = meta;
    this.descriptor = descriptor;
    this.containerId = containerId;
    this.widget = null;
  }

  mount(game) {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.warn(`Panel "${this.id}": no element #${this.containerId} found, skipping mount.`);
      return;
    }
    // Presentation hooks for style.css. Idempotent, so remounting is safe.
    container.classList.add("window");
    if (this.meta.title) container.dataset.title = this.meta.title;
    if (this.meta.theme) container.dataset.theme = this.meta.theme;

    this.widget = new Widget(this.descriptor, game);
    this.widget.mount(container);
  }

  unmount() {
    this.widget?.destroy();
    this.widget = null;
  }
}