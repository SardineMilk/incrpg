import { eff, sel, fml } from "../structures/structures.js";

const maxResources = () => [
  eff.setValue("health", fml.value("healthMax")),
  eff.setValue("stamina", fml.value("staminaMax")),
  eff.setValue("mental", fml.value("mentalMax")),
];


export const ACTORS = {
  player: {
    name: "Player",
    values: {health:0, stamina: 0, mental: 0},
    stats: {healthMax: 0, staminaMax: 0, mentalMax: 0},
    startup: [
      eff.activate(sel.tags("system", "conditions")),
      eff.activate(sel.tags("mortal", "conditions")),
      eff.activate("human"),
      eff.activate("new_meldrum"),
      eff.activate("plot_armor"),
      
      ...maxResources(),
    ]
  },

  rat: {
    name: "Rat",
    startup: [
      eff.activate(sel.tags("system", "conditions")),
      eff.activate(sel.tags("mortal", "conditions")),
      eff.activate("ratkin"),
      eff.activate("thorns"),
      eff.activate("punch"),
      eff.activate("new_meldrum"),

      ...maxResources(),
    ]
  }
};
