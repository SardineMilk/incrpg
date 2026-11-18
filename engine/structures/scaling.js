export function scaleAmount(_game, effect, mul) {
  const prev = effect.amount;
  return { ...effect, amount: (g) => (typeof prev === "function" ? prev(g) : prev) * mul };
}

export function scaleStatLayer(_game, effect, mul) {
  const prevFlat = effect.flat, prevPerc = effect.percent, prevMult = effect.multiplier;
  return {
    ...effect,
    flat:       (g) => (typeof prevFlat === "function" ? prevFlat(g) : prevFlat) * mul,
    percent:    (g) => (typeof prevPerc === "function" ? prevPerc(g) : prevPerc) * mul,
    multiplier: (g) => (((typeof prevMult === "function" ? prevMult(g) : prevMult) - 1) * mul) + 1,
  };
}