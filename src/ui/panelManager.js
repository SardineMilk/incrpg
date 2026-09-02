import { Panel } from "./panel.js";

let panels = [];

// This is the only place the player is special-cased
// UI effects are applied to the player
// This means you could play from the viewpoint of a goblin just by passing it here
export function initUI(world, actorId, panelDefs) {
  teardownUI();
  panels = Object.entries(panelDefs).map(
    ([id, def]) => new Panel(id, def.root, def.container)
  );
  for (const panel of panels) panel.mount(actorId);
}

export function teardownUI() {
  for (const panel of panels) panel.unmount();
  panels = [];
}

export function changeUIActor(actorId) {
  for (const panel of panels) {
    panel.unmount();
    panel.mount(actorId)
  }
}