const intervals = new Map();

self.onmessage = (e) => {
  const { type, id, delay } = e.data;

  if (type === "timeout") {
    const t = setTimeout(() => {
      self.postMessage({ type: "timeout", id });
    }, delay);

    intervals.set(id, t);
  }

  if (type === "interval") {
    const loop = () => {
      const t = setTimeout(() => {
        self.postMessage({ type: "interval", id });
        loop();
      }, delay);

      intervals.set(id, t);
    };

    loop();
  }

  if (type === "clear") {
    const t = intervals.get(id);
    if (t) clearTimeout(t);
    intervals.delete(id);
  }
};
