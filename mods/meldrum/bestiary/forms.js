import { eff, evt, fml, mod, target } from "../../../api/index.js";

export const FORMS = {
  rat: {
    tags: ["form", "beast", "rat"],
    passives: [
      eff.changeValue("healthMax",  45),
      eff.changeValue("staminaMax", 60),
      eff.changeValue("mentalMax",  20),
      // some rat-themed perk. maybe disable food poisoning?
    ],
  },

  rat_matriarch: {
    name: "Rat Matriarch",
    tags: ["form", "beast", "rat"],
    passives: [
      eff.changeValue("healthMax",  120),
      eff.changeValue("staminaMax", 100),
      eff.changeValue("mentalMax",  90),
    ],
    triggers: [{
        event: evt.valueLoss("health"),
        requirements: fml.and(fml.lt(fml.value("health"), 60), fml.inactive("rage")),
        effects: [
          eff.activate("rage"),
          eff.spawn("rat", "evil"),
          eff.spawn("rat", "evil"),
          eff.onTarget(target.team("good"), eff.sendMessage("SYSTEM", "The matriarch shrieks, the walls writhing as her brood answers")),
        ],
      }],
  },

  rock_crab: {
    name: "Rock Crab",
    tags: ["form", "beast"],
    passives: [
      eff.changeValue("healthMax",  75),
      eff.changeValue("staminaMax", 50),
      eff.changeValue("mentalMax",  30),
    ],
    modifiers: [{
      // 5 flat damage reduction on melee attacks
      event: evt.changeValue("health"),
      requirements: fml.and(fml.flag("isAttack"), fml.flag("melee")),
      modify: [mod.amount(fml.max(-5, fml.neg(fml.amount())))],  // TODO - macro for this pattern
    }]
  },

  wild_boar: {
    name: "Wild Boar",
    tags: ["form", "beast"],
    passives: [
      eff.changeValue("healthMax",  150),
      eff.changeValue("staminaMax", 130),
      eff.changeValue("mentalMax",  40),
    ],
    triggers: [{
      event: evt.valueLoss("health"),
      requirements: fml.and(fml.lt(fml.value("health"), 75), fml.inactive("rage")),
      effects: [
          eff.activate("rage"),
      ]
    }]
  },
};
