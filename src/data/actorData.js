import { eff, sel, fml } from "../structures/structures.js";

export const NPCS = {
  player: {
    values: {health:0, stamina: 0, mental: 0},
    stats: {healthMax: 0, staminaMax: 0, mentalMax: 0},
    startup: [
      eff.activate(sel.tags("system", "conditions")),
      eff.activate(sel.tags("mortal", "conditions")),
      eff.activate("human"),
      eff.activate("new_meldrum"),
    ]
  }
};
