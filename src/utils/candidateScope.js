
// Used to store and access information about current expanded selector candidate
export class CandidateScope {
  constructor() { this._stack = []; }

  with(candidate, fn) {
    this._stack.push(candidate);
    try { return fn(); }
    finally { this._stack.pop(); }
  }

  get(key) {
    const top = this._stack[this._stack.length - 1];
    return top && key in top ? top[key] : undefined;
  }
}