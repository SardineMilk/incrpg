import { eff } from "../../../api/index.js";

export const SURVIVAL = {
  // Survival

  survival: {
    name: "Survival",
    description: "Live off a land that would quite like you not to.",
    level: [],
    milestones: {
      5:  [eff.changeValue("healthMax", 3)],
      10: [eff.changeValue("staminaMax", 3)],
      15: [eff.xpMultiplier("constitution", { percent: 0.03 })],
    },
  },

  tracking: {
    name: "Tracking",
    description: "Lorem ipsum.",
    level: [],
    parent: "survival",
    milestones: {
      5:  [eff.xpMultiplier("hunting", { percent: 0.05 })],
      10: [eff.xpMultiplier("navigation", { percent: 0.05 })],
    },
  },

  navigation: {
    name: "Navigation",
    description:
      "The magic missile knows where it is, because it knows where it isn't. By subtracting where...",
    level: [],
    parent: "survival",
    milestones: {
      5:  [eff.xpMultiplier("walking", { percent: 0.05 })],
      10: [eff.changeValue("mentalMax", 2)],
    },
  },

  trapping: {
    name: "Trapping",
    description: "Now thats what I call passive income!",
    level: [],
    parent: "survival",
    milestones: {
      5:  [eff.xpMultiplier("hunting", { percent: 0.05 })],
      10: [eff.xpMultiplier("knot_tying", { percent: 0.05 })],
    },
  },

  riding: {
    name: "Riding",
    description:
      "Convince a large, powerful animal to go where you want instead of where it wants.",
    level: [],
    parent: "survival",
    milestones: {
      5:  [eff.changeValue("staminaMax", 3)],
      10: [eff.xpMultiplier("navigation", { percent: 0.05 })],
    },
  },

  mountaineering: {
    name: "Mountaineering",
    description: "Lorem ipsum.",
    level: [],
    parent: "survival",
    milestones: {
      5:  [eff.xpMultiplier("climbing", { percent: 0.08 })],
      10: [eff.changeValue("staminaMax", 3)],
    },
  },
};
