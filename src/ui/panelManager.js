import { PANELS } from "../data/panelsData.js";
import { Panel } from "./panel.js";

let panels = [];

// This is the only place the player is special-cased
// UI effects are applied to the player
// This means you could play from the viewpoint of a goblin just by passing it here
export function initUI(world, playerActor) {
  teardownUI();
  panels = Object.entries(PANELS).map(
    ([id, def]) => new Panel(id, def.root, def.container)
  );
  for (const panel of panels) panel.mount(playerActor);
}

export function teardownUI() {
  for (const panel of panels) panel.unmount();
  panels = [];
}