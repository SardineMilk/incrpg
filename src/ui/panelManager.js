import { PANELS } from "../data/panelsData.js";
import { Panel } from "./panel.js";

let panels = [];

export function initUI(game) {
  teardownUI();
  panels = Object.entries(PANELS).map(
    ([id, def]) => new Panel(id, def.root, def.container)
  );
  for (const panel of panels) panel.mount(game);
}

export function teardownUI() {
  for (const panel of panels) panel.unmount();
  panels = [];
}