import { eff } from "../../../api/index.js";

export const ATTRIBUTES = {
  // Attribute skills to allow them to level up and apply effects based on level. Don't add milestones
  // The rendering code treats these as a special case
  // TODO - stop hardcoding in rendering code, use sel.tag("characteristic")

  constitution: {
    tags: ["characteristic"],
    name: "Con",
    level: [
      eff.changeValue("healthMax", 2),
    ],
  },
  strength: {
    tags: ["characteristic"],
    name: "Str",
    level: [
      eff.changeValue("healthMax", 1),
      eff.changeValue("staminaMax", 1),
    ],
  },

  agility: {
    tags: ["characteristic"],
    name: "Agi",
    level: [
      eff.changeValue("staminaMax", 2),
    ],
  },
  wit: {
    tags: ["characteristic"],
    name: "Wit",
    level: [
      eff.changeValue("staminaMax", 1),
      eff.changeValue("mentalMax", 1),
    ],
  },

  intelligence: {
    tags: ["characteristic"],
    name: "Int",
    level: [
      eff.changeValue("mentalMax", 2),
    ],
  },
  willpower: {
    tags: ["characteristic"],
    name: "Wil",
    level: [
      eff.changeValue("healthMax", 1),
      eff.changeValue("mentalMax", 1),
    ],
  },
};
