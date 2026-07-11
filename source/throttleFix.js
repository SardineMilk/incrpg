const worker = new Worker(new URL("./timerWorker.js", import.meta.url), {
  type: "module",
});

const callbacks = new Map();
let idCounter = 1;

worker.onmessage = (e) => {
  const { type, id } = e.data;
  const cb = callbacks.get(id);

  if (!cb) return;

  if (type === "timeout") {
    callbacks.delete(id);
    cb();
  }

  if (type === "interval") {
    cb();
  }
};

export function setTimeoutFix(cb, delay) {
  const id = idCounter++;
  callbacks.set(id, cb);
  worker.postMessage({ type: "timeout", id, delay });
  return id;
}

export function setIntervalFix(cb, delay) {
  const id = idCounter++;
  callbacks.set(id, cb);
  worker.postMessage({ type: "interval", id, delay });
  return id;
}

export function clearIntervalFix(id) {
  callbacks.delete(id);
  worker.postMessage({ type: "clear", id });
}

export function clearTimeoutFix(id) {
  callbacks.delete(id);
  worker.postMessage({ type: "clear", id });
}
