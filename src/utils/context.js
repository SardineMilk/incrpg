export class ContextStack {
  constructor(maxDepth = 128) {
    this._stack = [];
    this._maxDepth = maxDepth;
  }

  // Add data to the context stack, run fn, guarantee data is removed from the stack
  with(data, fn, label) {
    if (this._stack.length >= this._maxDepth) {
      throw new Error(
        `Context stack exceeded max depth of ${this._maxDepth}. ` +
        `Congratulations or condolences as appropriate. ` +
        `Trace: ${this.describe()}`
      );
    }
    this._stack.push({ data, label });
    try {
      return fn();
    } finally {
      this._stack.pop();
    }
  }

  // Scans from the innermost frame outward.
  get(key) {
    for (let i = this._stack.length - 1; i >= 0; i--) {
      const frame = this._stack[i].data;
      if (frame && key in frame) return frame[key];
    }
    return undefined;
  }

  // Mutates the nearest frame that already defines `key`.
  // Used by modifiers to alter effects currently on the stack
  set(key, value) {
    for (let i = this._stack.length - 1; i >= 0; i--) {
      const frame = this._stack[i].data;
      if (frame && key in frame) { frame[key] = value; return true; }
    }
    return false;
  }

  get depth() { return this._stack.length; }

  // Debug aid - return the current stack as a string
  describe() {
    return this._stack.map(f => f.label ?? JSON.stringify(f.data)).join(" > ");
  }
}