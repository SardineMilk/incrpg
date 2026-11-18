import { eff } from "../../../api/index.js";

export const SUBTERFUGE = {
  // Subterfuge

  subterfuge: {
    name: "Subterfuge",
    description:
      "The fine art of being somewhere you shouldn't, and leaving before anyone notices. Best attempted with a high-vis vest.",
    level: [],
    milestones: {
      5:  [eff.changeValue("staminaMax", 3)],
      10: [eff.xpMultiplier("wit", { percent: 0.03 })],
      15: [eff.changeValue("mentalMax", 3)],
    },
  },

  sneaking: {
    name: "Sneaking",
    description:
      "Move without being seen, heard, or otherwise noticed. Best attempted without a high-vis vest.",
    level: [],
    parent: "subterfuge",
    milestones: {
      5:  [eff.xpMultiplier("ambushing", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
      15: [eff.xpMultiplier("tracking", { percent: 0.05 })],
    },
  },

  lockpicking: {
    name: "Lockpicking",
    description: "Convince a lock that you're the key.",
    level: [],
    parent: "subterfuge",
    milestones: {
      5:  [eff.xpMultiplier("pickpocketing", { percent: 0.05 })],
      10: [eff.changeValue("mentalMax", 2)],
    },
  },

  pickpocketing: {
    name: "Pickpocketing",
    description: "People are so generous around here.",
    level: [],
    parent: "subterfuge",
    milestones: {
      5:  [eff.xpMultiplier("dagger", { percent: 0.05 })],
      10: [eff.xpMultiplier("sneaking", { percent: 0.05 })],
    },
  },

  ambushing: {
    name: "Ambushing",
    description: "Must have been the wi-",
    level: [],
    parent: "subterfuge",
    milestones: {
      5:  [eff.xpMultiplier("sneaking", { percent: 0.05 })],
      10: [eff.xpMultiplier("dagger", { percent: 0.05 })],
    },
  },
};
