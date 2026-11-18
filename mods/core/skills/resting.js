import { eff } from "../../../api/index.js";

export const RESTING = {
  // ── Resting ───────────────────────────────────────────────────────────

  resting: {
    name: "Resting",
    description: "Do nothing. Faster.",
    level: [],
    milestones: {
      5:  [eff.changeValue("staminaMax", 3)],
      10: [eff.changeValue("mentalMax", 3)],
      15: [eff.changeValue("healthMax", 3)],
    },
  },

  meditation: {
    name: "Meditation",
    description:
      "Clear your mind and relax. Nobody can agree on what exactly it means to meditate, but whatever you're doing seems to help.",
    level: [],
    parent: "resting",
    milestones: {
      5:  [eff.xpMultiplier("breathing", { percent: 0.08 })],
      10: [eff.changeStrength("mental_regen", { percent: 0.05 })],
      15: [eff.xpMultiplier("willpower", { percent: 0.03 })],
    },
  },

  sleeping: {
    name: "Sleeping",
    description:
      "Learn to sleep better, because everything's a skill. Get more from your shut-eye.",
    level: [],
    parent: "resting",
    milestones: {
      5:  [eff.changeStrength("health_regen", { percent: 0.03 })],
      10: [eff.changeStrength("stamina_regen", { percent: 0.03 })],
      15: [eff.changeStrength("mental_regen", { percent: 0.03 })],
    },
  },
};
