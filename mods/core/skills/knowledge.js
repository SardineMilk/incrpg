import { eff } from "../../../api/index.js";

export const KNOWLEDGE = {
  // ── Knowledge ─────────────────────────────────────────────────────────

  knowledge: {
    name: "Knowledge",
    description: "Lorem ipsum.",
    level: [],
    milestones: {
      5:  [eff.changeValue("mentalMax", 3)],
      10: [eff.xpMultiplier("intelligence", { percent: 0.03 })],
      15: [eff.changeValue("mentalMax", 5)],
    },
  },

  observation: {
    name: "Observation",
    description: "Lorem ipsum.",
    level: [],
    parent: "knowledge",
    milestones: {
      5:  [eff.xpMultiplier("tracking", { percent: 0.05 })],
      10: [eff.xpMultiplier("archery", { percent: 0.05 })],
      15: [eff.changeValue("mentalMax", 2)],
    },
  },

  anatomy: {
    name: "Anatomy",
    description: "Lorem ipsum.",
    level: [],
    parent: "knowledge",
    milestones: {
      5:  [eff.xpMultiplier("unarmed", { percent: 0.05 })],
      10: [eff.xpMultiplier("regeneration", { percent: 0.05 })],
    },
  },

  occultism: {
    name: "Occultism",
    description: "Lorem ipsum.",
    level: [],
    parent: "knowledge",
    milestones: {
      5:  [eff.changeValue("mentalMax", 2)],
      10: [eff.xpMultiplier("mindfulness", { percent: 0.05 })],
    },
  },

  strategy: {
    name: "Strategy",
    description: "Lorem ipsum.",
    level: [],
    parent: "knowledge",
    milestones: {
      5:  [eff.xpMultiplier("combat", { percent: 0.03 })],
      10: [eff.changeValue("mentalMax", 2)],
    },
  },

  appraising: {
    name: "Appraising",
    description: "Lorem ipsum.",
    level: [],
    parent: "knowledge",
    milestones: {
      5:  [eff.xpMultiplier("negotiation", { percent: 0.05 })],
      10: [eff.changeValue("mentalMax", 2)],
    },
  },
};
