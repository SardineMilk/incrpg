import { eff } from "../../../api/index.js";

export const TRAINING = {
  // ── Training ──────────────────────────────────────────────────────────

  training: {
    name: "Training",
    description: "Get stronger without risking your life, a revolutionary concept.",
    level: [],
    milestones: {
      5:  [eff.changeValue("staminaMax", 3)],
      10: [eff.xpMultiplier("strength", { percent: 0.03 })],
      15: [eff.changeValue("healthMax", 3)],
    },
  },

  exercise: {
    name: "Exercise",
    description: "Expend physical effort without any clear goal or reward. A luxurious pastime.",
    level: [],
    parent: "training",
    milestones: {
      5:  [eff.xpMultiplier("strength", { percent: 0.03 })],
      10: [eff.changeValue("staminaMax", 3)],
    },
  },

  sparring: {
    name: "Sparring",
    description: "Fight your friends in a friendly way. Don't go for the kill. Avoid maiming.",
    level: [],
    parent: "training",
    milestones: {
      5:  [eff.xpMultiplier("weapon_proficiency", { percent: 0.05 })],
      10: [eff.xpMultiplier("unarmed", { percent: 0.05 })],
    },
  },
};
