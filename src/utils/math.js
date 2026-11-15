export function xpToNext(level) {
  const scalingFactor = 100;
  return Math.floor(scalingFactor * Math.pow(2, level / 5));
}

export function sample(rng, items, count = 1) {
  const pool = [...items];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}