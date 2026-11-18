import { eff } from "../../../api/index.js";

export const TRAVERSAL = {
  // ── Traversal ─────────────────────────────────────────────────────────

  traversal: {
    name: "Traversal",
    description: "Move from point A to point B. Do it faster.",
    level: [],
    milestones: {
      5:  [eff.changeValue("staminaMax", 3)],
      10: [eff.xpMultiplier("agility", { percent: 0.03 })],
      15: [eff.changeValue("staminaMax", 5)],
    },
  },

  running: {
    name: "Running",
    description:
      "Run, run, as fast as you can. Maybe it'll save your life someday",
    level: [],
    parent: "traversal",
    milestones: {
      5:  [eff.changeValue("staminaMax", 3)],
      10: [eff.xpMultiplier("parkour", { percent: 0.05 })],
      15: [eff.changeStrength("stamina_regen", { percent: 0.03 })],
    },
  },

  walking: {
    name: "Walking",
    description:
      "The difference between a lovely stroll and miserable slog is a thin line. Use the line to lace your boots.",
    level: [],
    parent: "traversal",
    milestones: {
      5:  [eff.changeValue("staminaMax", 2)],
      10: [eff.xpMultiplier("navigation", { percent: 0.05 })],
    },
  },

  climbing: {
    name: "Climbing",
    description:
      "Learn how to cling to a vertical surface without exhausting yourself.",
    level: [
      eff.changeStrength("climbing_height_gain", {percent: 0.1})
    ],
    parent: "traversal",
    milestones: {
      5:  [eff.xpMultiplier("mountaineering", { percent: 0.08 })],
      10: [eff.changeValue("staminaMax", 3)],
      15: [eff.changeStrength("climbing_height_gain", { multiplier: 1.25 })],
    },
  },

  swimming: {
    name: "Swimming",
    description: "Lorem ipsum.",
    level: [],
    parent: "traversal",
    milestones: {
      5:  [eff.changeValue("staminaMax", 3)],
      10: [eff.xpMultiplier("fishing", { percent: 0.05 })],
    },
  },

  parkour: {
    name: "Parkour",
    description: "You took 'as the crow flies' as a personal challenge.",
    level: [],
    parent: "traversal",
    milestones: {
      5:  [eff.xpMultiplier("running", { percent: 0.05 })],
      10: [eff.xpMultiplier("acrobatics", { percent: 0.05 })],
    },
  },

  acrobatics: {
    name: "Acrobatics",
    description: "Flip, flop, and land on your feet more often than not.",
    level: [],
    parent: "traversal",
    milestones: {
      5:  [eff.xpMultiplier("evasion", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 3)],
      15: [eff.xpMultiplier("parkour", { percent: 0.05 })],
    },
  },
};
