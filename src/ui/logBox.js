const FOLLOW_THRESHOLD = 5;

export class LogView {
  // `container` becomes the scroll element.
  constructor(container, log, { rowHeight = 40, overscan = 20 } = {}) {
    this.container = container;
    this.log = log;
    this.rowHeight = rowHeight;
    this.overscan = overscan;

    this.followTail = true; // true while the reader is looking at the newest entries
    this.pool = [];
    this._frame = null;
    this._destroyed = false;
    this._seenDropped = log.dropped;

    container.style.overflowY = "auto";
    container.style.height = "100%";

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
    container.appendChild(this.viewport);

    this._onScroll = () => {
      this.followTail =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - FOLLOW_THRESHOLD;
      this._schedule();
    };
    container.addEventListener("scroll", this._onScroll);

    this._resizeObserver = new ResizeObserver(() => this._schedule());
    this._resizeObserver.observe(container);

    this._unsubscribe = log.subscribe(() => this._schedule());

    this._render();
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    if (this._frame !== null) cancelAnimationFrame(this._frame);
    this._frame = null;
    this._unsubscribe();
    this._resizeObserver.disconnect();
    this.container.removeEventListener("scroll", this._onScroll);
    this.viewport.remove();
  }

  _schedule() {
    if (this._destroyed || this._frame !== null) return;
    this._frame = requestAnimationFrame(() => {
      this._frame = null;
      this._render();
    });
  }

  _render() {
    if (this._destroyed) return;

    const { container, rowHeight, overscan, pool, content, viewport } = this;
    const { events, dropped } = this.log;

    viewport.style.height = `${events.length * rowHeight}px`;

    // Rows trimmed off the front shift everything up. Compensate so a reader
    // who has scrolled back doesn't see the text slide under them.
    const trimmed = dropped - this._seenDropped;
    this._seenDropped = dropped;
    if (this.followTail) {
      container.scrollTop = container.scrollHeight;
    } else if (trimmed > 0) {
      container.scrollTop = Math.max(0, container.scrollTop - trimmed * rowHeight);
    }

    const scrollTop = container.scrollTop;
    const height = container.clientHeight;

    const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const last = Math.min(
      events.length,
      Math.ceil((scrollTop + height) / rowHeight) + overscan,
    );
    const needed = Math.max(0, last - first);

    while (pool.length < needed) {
      const node = document.createElement("div");
      node.className = "log-element";
      node.style.position = "absolute";
      node.style.left = "0";
      node.style.right = "0";
      node.style.height = `${rowHeight}px`;
      content.appendChild(node);
      pool.push(node);
    }

    for (let i = 0; i < pool.length; i++) {
      const node = pool[i];
      if (i >= needed) {
        if (node.style.display !== "none") node.style.display = "none";
        continue;
      }

      const row = first + i;
      const event = events[row];

      if (node.style.display === "none") node.style.display = "";

      const transform = `translateY(${row * rowHeight}px)`;
      if (node.style.transform !== transform) node.style.transform = transform;

      // Row index alone isn't identity once the log trims from the front,
      // so always compare the text too.
      if (node.dataset.row !== String(row)) node.dataset.row = row;
      if (node.textContent !== event.text) node.textContent = event.text;
    }
  }
}