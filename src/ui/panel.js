import { Widget } from "./widget.js";

export class Panel {
  constructor(id, descriptor, containerId) {
    this.id = id;
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
    this.widget = new Widget(this.descriptor, game);
    this.widget.mount(container);
  }

  unmount() {
    this.widget?.destroy();
    this.widget = null;
  }
}