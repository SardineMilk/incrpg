export function renderLog(game) {
  const { container, rowHeight, overscan, events, visibleNodes, content } =
    game.log;

  const scrollTop = container.scrollTop;
  const height = container.clientHeight;

  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);

  const last = Math.min(
    events.length,
    Math.ceil((scrollTop + height) / rowHeight) + overscan,
  );

  const needed = new Set();

  for (let row = first; row < last; row++) {
    needed.add(row);

    let node = visibleNodes.get(row);

    if (!node) {
      node = document.createElement("div");
      node.className = "log-element";

      node.style.position = "absolute";
      node.style.left = "0";
      node.style.right = "0";
      node.style.height = `${rowHeight}px`;

      content.appendChild(node);

      visibleNodes.set(row, node);
    }

    const event = events[row];

    node.style.transform = `translateY(${row * rowHeight}px)`;

    node.textContent = event.text;
  }

  for (const [row, node] of visibleNodes) {
    if (!needed.has(row)) {
      node.remove();
      visibleNodes.delete(row);
    }
  }
}
