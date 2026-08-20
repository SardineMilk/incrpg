/*
* Every tooltip mounts to a shared floating layer
* to avoid z-fighting
*/
let layer = null;

export function getTooltipLayer() {
  if (layer) return layer;
  layer = document.createElement("div");
  layer.id = "ui-tooltip-layer";
  document.body.appendChild(layer);
  return layer;
}