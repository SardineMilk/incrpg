import { eff } from "../../../api/index.js";

export const SOCIAL = {
  // ── Social ────────────────────────────────────────────────────────────

  social: {
    name: "Social",
    description: "Lorem ipsum.",
    level: [],
    milestones: {
      5:  [eff.changeValue("mentalMax", 3)],
      10: [eff.xpMultiplier("willpower", { percent: 0.03 })],
      15: [eff.changeValue("mentalMax", 5)],
    },
  },

  persuasion: {
    name: "Persuasion",
    description: "Lorem ipsum.",
    level: [],
    parent: "social",
    milestones: {
      5:  [eff.xpMultiplier("negotiation", { percent: 0.05 })],
      10: [eff.changeValue("mentalMax", 2)],
    },
  },

  negotiation: {
    name: "Negotiation",
    description: "Both sides think they got scammed. That's how you know it went well.",
    level: [],
    parent: "social",
    milestones: {
      5:  [eff.xpMultiplier("persuasion", { percent: 0.05 })],
      10: [eff.xpMultiplier("appraising", { percent: 0.05 })],
    },
  },

  intimidation: {
    name: "Intimidation",
    description: "Lorem ipsum.",
    level: [],
    parent: "social",
    milestones: {
      5:  [eff.xpMultiplier("combat", { percent: 0.03 })],
      10: [eff.changeValue("healthMax", 2)],
    },
  },

  storytelling: {
    name: "Storytelling",
    description: "Lorem ipsum.",
    level: [],
    parent: "social",
    milestones: {
      5:  [eff.xpMultiplier("persuasion", { percent: 0.05 })],
      10: [eff.changeValue("mentalMax", 2)],
    },
  },
};
