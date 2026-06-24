
export function makeStatLayer() {
  return { flat: 0, percent: 1, multiplier: 1 };
}

export function resolveStatLayer(layer) {
  return layer.flat * layer.percent * layer.multiplier;
}

export function resetStatLayer(layer) {
  layer.flat = 0; layer.percent = 1; layer.multiplier = 1;
}

export function applyStatLayer(layer, { flat, percent, multiplier }) {
    layer.flat      += flat      ?? 0;
    layer.percent   *= percent   ?? 1;   
    layer.multiplier *= multiplier ?? 1;
}
