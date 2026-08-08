const EMPTY_DEPS = new Set(); 

export class Reactor {
  constructor(maxDepth = 64) {
    this._subscribers = new Map();  // cellKey -> Set<subscription>
    this._trackStack = [];          // topmost frame collects reads
    this._maxDepth = maxDepth;      // bounds nested chains. increase for stronger infinites
    this._notifyDepth = 0;
  }

  read(cellKey) {
    const frame = this._trackStack[this._trackStack.length - 1];
    if (!frame) return;
    (frame.deps ??= new Set()).add(cellKey);
  }

  // Run fn, capturing every cell it read. Returns { result, deps }.
  // static effects (no reads into game state) return empty deps
  track(fn) {
    const frame = { deps: null };
    this._trackStack.push(frame);
    try {
      const result = fn();
      return { result, deps: frame.deps ?? EMPTY_DEPS };
    } finally {
      this._trackStack.pop();
    }
  }

  notify(cellKey) {
    const subs = this._subscribers.get(cellKey);
    if (!subs || subs.size === 0) return;

    if (this._notifyDepth >= this._maxDepth) {
      console.warn(
        `Reactor: max notify depth of ${this._maxDepth} reached while notifying '${cellKey}'. ` +
        `Congratulations or condolences as appropriate.`)
      return;
    }

    this._notifyDepth++;
    try {
    for (const sub of [...subs]) {
      // unsubscribed mid-resolve e.g. deactivate condition
      if (!sub.cellKeys.has(cellKey)) continue; 
      sub.run();
    }
    } finally {
      this._notifyDepth--;
    }
  }

  subscribe(cellKeys, run) {
    const sub = { run, cellKeys: EMPTY_DEPS };
    this._resubscribe(sub, cellKeys);
    return sub;
  }

  // A subscription's dependencies can shift between runs 
  // e.g. ternary formula w/ dif reads on each path
  // so every re-run replaces the subscription set instead of adding
  resubscribe(sub, cellKeys) { this._resubscribe(sub, cellKeys); }

  unsubscribe(sub) { this._resubscribe(sub, EMPTY_DEPS); }

  _resubscribe(sub, cellKeys) {
    for (const key of sub.cellKeys) {
      const set = this._subscribers.get(key);
      if (!set) continue;
      set.delete(sub);
      if (set.size === 0) this._subscribers.delete(key);
    }

    sub.cellKeys = cellKeys;
    for (const key of cellKeys) {
      if (!this._subscribers.has(key)) this._subscribers.set(key, new Set());
      this._subscribers.get(key).add(sub);
    }
  }
}