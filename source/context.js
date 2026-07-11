
const _contextStack = [];
export function withContext(ctx, fn) {
  _contextStack.push(ctx);
  try {
    return fn();
  } finally {
    _contextStack.pop();
  }
}
export function currentContext() {
  return _contextStack[_contextStack.length - 1] ?? {};
}
