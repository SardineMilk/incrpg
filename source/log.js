export const LogType = {
  SKILL: 1 << 0,
  ACTION: 1 << 1,
  ITEM: 1 << 2,
  DIALOGUE: 1 << 3,
  SYSTEM: 1 << 4,
};

export class EventLog {
  constructor({ container, rowHeight = 40, overscan = 20 }) {
    if (!container) throw new Error("EventLog requires a valid container");
    this.container = container;
    this.rowHeight = rowHeight;
    this.overscan = overscan;

    this.events = [];
    this.visibleNodes = new Map();

    // true when viewing the newest entries
    this.followTail = true;

    this.viewport = document.createElement("div");
    this.viewport.style.position = "relative";
    this.viewport.style.width = "100%";

    this.content = document.createElement("div");
    this.content.style.position = "absolute";
    this.content.style.top = "0";
    this.content.style.left = "0";
    this.content.style.right = "0";
    this.content.style.width = "100%";

    this.viewport.appendChild(this.content);
    this.container.appendChild(this.viewport);

    this.container.addEventListener("scroll", () => {
      const threshold = 5;

      this.followTail =
        this.container.scrollTop + this.container.clientHeight >=
        this.container.scrollHeight - threshold;
    });
  }

  append(type, text) {
    const event = { type, text };

    this.events.push(event);

    this.viewport.style.height = `${this.events.length * this.rowHeight}px`;

    // Follow new entries only if the user was
    // already looking at the bottom.
    if (this.followTail) {
      this.container.scrollTop = this.container.scrollHeight;
    }
  }
}
