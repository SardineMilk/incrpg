import { eff, sel, fml } from "../../api/index.js";

const maxResources = () => [
  eff.setValue("health", fml.value("healthMax")),
  eff.setValue("stamina", fml.value("staminaMax")),
  eff.setValue("mental", fml.value("mentalMax")),
];

const foe = (name, form, action) => ({
  name,
  values: {health:0, stamina: 0, mental: 0},
  startup: [
    eff.activate(sel.tags("system", "conditions")),
    eff.activate("health_death"),
    eff.activate(form),
    eff.activate(action),
    ...maxResources(),
  ],
});


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

  rat:              foe("Feral Rat",      "rat",            "rat_bite"),
  rat_matriarch:    foe("Rat Matriarch",  "rat_matriarch",  "rat_gnaw"),
  rock_crab:        foe("Rock Crab",      "rock_crab",      "crab_pinch"),
  wild_boar:        foe("Wild Boar",      "wild_boar",      "boar_gore"),
};
