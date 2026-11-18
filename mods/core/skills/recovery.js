import { eff } from "../../../api/index.js";

export const RECOVERY = {
  // Recovery 

  recovery: {
    name: "Recovery",
    description:
      "Restore yourself to peak condition. What almost kills you makes you stronger.",
    level: [],
    milestones: {
      5:  [eff.changeValue("healthMax", 3)],
      10: [eff.changeValue("staminaMax", 3)],
      15: [eff.changeValue("mentalMax", 3)],
    },
  },

  regeneration: {
    name: "Regeneration",
    description:
      "If you keep getting hurt, your body learns to heal faster. Thats how it works.",
    level: [eff.changeStrength("health_regen", {percent: 0.1})],
    parent: "recovery",
    milestones: {
      5:  [eff.xpMultiplier("unarmed", { percent: 0.05 })],
      10: [eff.changeValue("healthMax", 4)],
      15: [eff.changeStrength("health_regen", { percent: 0.05 })],
    },
  },
  breathing: {
    name: "Breathing",
    description:
      "You're breathing wrong. In through the nose. Bring air down to the belly. Out through the mouth.",
    level: [eff.changeStrength("stamina_regen", {percent: 0.1})],
    parent: "recovery",
    milestones: {
      5:  [eff.xpMultiplier("meditation", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 4)],
      15: [eff.changeStrength("stamina_regen", { percent: 0.05 })],
    },
  },
  mindfulness: {
    name: "Mindfulness",
    description: "Become more aware of your mental state, whats affecting it, and how to improve it.",
    level: [eff.changeStrength("mental_regen", {percent: 0.1})],
    parent: "recovery",
    milestones: {
      5:  [eff.xpMultiplier("meditation", { percent: 0.05 })],
      10: [eff.changeValue("mentalMax", 4)],
      15: [eff.changeStrength("mental_regen", { percent: 0.05 })],
    },
  },
};
