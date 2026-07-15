
export function renderLog(game) {
  const { container, rowHeight, overscan, events, content } = game.log;

  const pool = (game.log.pool ??= []);

  const scrollTop = container.scrollTop;
  const height = container.clientHeight;

  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const last = Math.min(
    events.length,
    Math.ceil((scrollTop + height) / rowHeight) + overscan,
  );

  const needed = last - first;

   // Grow the pool if more slots are needed
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

  // Shrink visible pool if the viewport got smaller 
  for (let i = 0; i < pool.length; i++) {
    const node = pool[i];
    if (i >= needed) {
      if (node.style.display !== "none") node.style.display = "none";
      continue;
    }

    const row = first + i;
    const event = events[row];

    if (node.style.display === "none") node.style.display = "";

    // Only touch the DOM if something actually changed.
    const transform = `translateY(${row * rowHeight}px)`;
    if (node.style.transform !== transform) {
      node.style.transform = transform;
    }
    if (node.dataset.row !== String(row)) {
      node.dataset.row = row;
      node.textContent = event.text;
    } else if (node.textContent !== event.text) {
      // Future proofing: Same row somehow has new text
      node.textContent = event.text;
    }
  }
}