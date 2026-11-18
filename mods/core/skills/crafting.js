import { eff } from "../../../api/index.js";

export const CRAFTING = {
  // ── Crafting ──────────────────────────────────────────────────────────

  crafting: {
    name: "Crafting",
    description: "Transform raw materials into something more useful. Hopefully.",
    level: [],
    milestones: {
      5:  [eff.changeValue("mentalMax", 3)],
      10: [eff.xpMultiplier("intelligence", { percent: 0.03 })],
      15: [eff.changeValue("staminaMax", 3)],
    },
  },

  carpentry: {
    name: "Carpentry",
    description: "Cut wood into smaller pieces and somehow end up with furniture.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("woodcutting", { percent: 0.05 })],
      10: [eff.xpMultiplier("engraving", { percent: 0.05 })],
    },
  },

  smithing: {
    name: "Smithing",
    description: "Turns out you're not actually meant to heat iron `red-hot`. Temper your expectations",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("mining", { percent: 0.05 })],
      10: [eff.xpMultiplier("weapon_maintenance", { percent: 0.05 })],
      15: [eff.xpMultiplier("armour_smithing", { percent: 0.05 })],
    },
  },

  weapon_maintenance: {
    name: "Weapon Maintenance",
    description: "It would be very embarrassing if your spear head fell off. Don't let that happen",
    level: [],
    parent: "smithing",
    milestones: {
      5:  [eff.xpMultiplier("weapon_proficiency", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
    },
  },

  armour_smithing: {
    name: "Armour Smithing",
    description: "Lorem ipsum.",
    level: [],
    parent: "smithing",
    milestones: {
      5:  [eff.xpMultiplier("smithing", { percent: 0.05 })],
      10: [eff.changeValue("healthMax", 3)],
    },
  },

  cooking: {
    name: "Cooking",
    description: "Improve food through the careful application of heat. Usually.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("harvesting", { percent: 0.05 })],
      10: [eff.xpMultiplier("butchery", { percent: 0.05 })],
      15: [eff.changeStrength("stamina_regen", { percent: 0.03 })],
    },
  },

  baking: {
    name: "Baking",
    description: "Cooking, but more science than art.",
    level: [],
    parent: "cooking",
    milestones: {
      5:  [eff.xpMultiplier("cooking", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
    },
  },

  brewing: {
    name: "Brewing",
    description: "Turn perfectly good fruit into something far more interesting.",
    level: [],
    parent: "cooking",
    milestones: {
      5:  [eff.xpMultiplier("herbalism", { percent: 0.05 })],
      10: [eff.changeValue("mentalMax", 2)],
    },
  },

  butchery: {
    name: "Butchery",
    description: "Lorem ipsum.",
    level: [],
    parent: "cooking",
    milestones: {
      5:  [eff.xpMultiplier("hunting", { percent: 0.05 })],
      10: [eff.xpMultiplier("leatherworking", { percent: 0.05 })],
    },
  },

  stoneworking: {
    name: "Stoneworking",
    description: "Lorem ipsum.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("mining", { percent: 0.05 })],
      10: [eff.xpMultiplier("engraving", { percent: 0.05 })],
      15: [eff.changeValue("healthMax", 2)],
    },
  },

  engraving: {
    name: "Engraving",
    description: "Lorem ipsum.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("observation", { percent: 0.05 })],
      10: [eff.xpMultiplier("jewelry_making", { percent: 0.05 })],
    },
  },

  jewelry_making: {
    name: "Jewelry Making",
    description: "Lorem ipsum.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("prospecting", { percent: 0.05 })],
      10: [eff.xpMultiplier("appraising", { percent: 0.05 })],
    },
  },

  leatherworking: {
    name: "Leatherworking",
    description: "Lorem ipsum.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("butchery", { percent: 0.05 })],
      10: [eff.changeValue("healthMax", 2)],
    },
  },

  alchemy: {
    name: "Alchemy",
    description: "Chemistry that occasionally explodes, but in a useful and interesting way.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("herbalism", { percent: 0.05 })],
      10: [eff.xpMultiplier("poisoncraft", { percent: 0.08 })],
      15: [eff.changeValue("mentalMax", 3)],
    },
  },

  poisoncraft: {
    name: "Poisoncraft",
    description: "The line between medicine and poison is mostly dosage, and you're getting good at dosage.",
    level: [],
    parent: "alchemy",
    milestones: {
      5:  [eff.xpMultiplier("alchemy", { percent: 0.05 })],
      10: [eff.xpMultiplier("dagger", { percent: 0.05 })],
    },
  },
};
