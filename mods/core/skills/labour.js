import { eff } from "../../../api/index.js";

export const LABOUR = {
  // ── Labour ────────────────────────────────────────────────────────────

  labour: {
    name: "Labour",
    description: "Lorem ipsum.",
    level: [],
    milestones: {
      5:  [eff.changeValue("staminaMax", 3)],
      10: [eff.changeValue("healthMax", 3)],
      15: [eff.xpMultiplier("strength", { percent: 0.03 })],
    },
  },

  hauling: {
    name: "Hauling",
    description: "Carry heavy things from where they are to where they need to be.",
    level: [],
    parent: "labour",
    milestones: {
      5:  [eff.xpMultiplier("strength", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 3)],
      15: [eff.xpMultiplier("knot_tying", { percent: 0.05 })],
    },
  },

  knot_tying: {
    name: "Knot Tying",
    description: "There are hundreds of knots. You will actually use... about 4.",
    level: [],
    parent: "labour",
    milestones: {
      5:  [eff.xpMultiplier("hauling", { percent: 0.05 })],
      10: [eff.xpMultiplier("trapping", { percent: 0.05 })],
    },
  },

  gathering: {
    name: "Gathering",
    description: "So many things are just lying around. It's only stealing if someone owns it.",
    level: [],
    parent: "labour",
    milestones: {
      5:  [eff.changeValue("staminaMax", 3)],
      10: [eff.xpMultiplier("wit", { percent: 0.03 })],
      15: [eff.changeValue("staminaMax", 5)],
    },
  },

  woodcutting: {
    name: "Woodcutting",
    description: "Turn a tree into more, smaller trees.",
    level: [],
    parent: "gathering",
    milestones: {
      5:  [eff.xpMultiplier("axe", { percent: 0.08 })],
      10: [eff.changeValue("staminaMax", 2)],
      15: [eff.xpMultiplier("carpentry", { percent: 0.05 })],
    },
  },

  harvesting: {
    name: "Harvesting",
    description: "Pick things before they rot. Hopefully.",
    level: [],
    parent: "gathering",
    milestones: {
      5:  [eff.xpMultiplier("herbalism", { percent: 0.05 })],
      10: [eff.xpMultiplier("cooking", { percent: 0.05 })],
    },
  },

  herbalism: {
    name: "Herbalism",
    description: "Plants. Powerful plants. My plants, now.",
    level: [],
    parent: "harvesting",
    milestones: {
      5:  [eff.xpMultiplier("alchemy", { percent: 0.08 })],
      10: [eff.changeValue("mentalMax", 2)],
    },
  },

  mining: {
    name: "Mining",
    description: "Digging a big hole is it's own reward. Anything you find is just a bonus.",
    level: [],
    parent: "gathering",
    milestones: {
      5:  [eff.xpMultiplier("prospecting", { percent: 0.08 })],
      10: [eff.changeValue("healthMax", 2)],
      15: [eff.xpMultiplier("smithing", { percent: 0.05 })],
    },
  },

  prospecting: {
    name: "Prospecting",
    description: "Find the good rocks when digging a hole.",
    level: [],
    parent: "mining",
    milestones: {
      5:  [eff.xpMultiplier("mining", { percent: 0.05 })],
      10: [eff.xpMultiplier("jewelry_making", { percent: 0.05 })],
    },
  },

  fishing: {
    name: "Fishing",
    description: "Lorem ipsum.",
    level: [],
    parent: "gathering",
    milestones: {
      5:  [eff.xpMultiplier("cooking", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
    },
  },

  hunting: {
    name: "Hunting",
    description: "Gathering, if the ingredients could run away and sometimes fight back.",
    level: [],
    parent: "gathering",
    milestones: {
      5:  [eff.xpMultiplier("tracking", { percent: 0.05 })],
      10: [eff.xpMultiplier("butchery", { percent: 0.08 })],
      15: [eff.xpMultiplier("archery", { percent: 0.05 })],
    },
  },
};
