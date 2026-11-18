import { eff } from "../../../api/index.js";

export const COMBAT = {
  // Combat 

  combat: {
    name: "Combat",
    description: "Pit your mind and body against another in battle.",
    level: [],
    milestones: {
      5:  [eff.changeValue("healthMax", 3)],
      10: [eff.xpMultiplier("evasion", { percent: 0.05 })],
      15: [eff.changeValue("healthMax", 5)],
    },
  },

  /*
  * Leveling weapon skills unlocks Styles
  * Styles are mutually exclusive, used in combat
  * They give buffs
  * Determine which combat actions you automatically take
  */
  weapon_proficiency: {
    name: "Weapon Proficiency",
    description:
      "Mastery of melee weapons. Wield them as an extension of your body.",
    level: [],
    parent: "combat",
    milestones: {
      5:  [eff.xpMultiplier("weapon_maintenance", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 3)],
      15: [eff.xpMultiplier("strength", { percent: 0.03 })],
    },
  },

  club: {
    name: "Club Fighting",
    description:
      "A hammer. A stick. The closest rock. The first weapon ever used, and it holds up today.",
    level: [],
    parent: "weapon_proficiency",
    milestones: {
      5:  [eff.xpMultiplier("hauling", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
    },
  },

  sword: {
    name: "Sword Fighting",
    description: "A tool of war.",
    level: [],
    parent: "weapon_proficiency",
    milestones: {
      5:  [eff.xpMultiplier("weapon_maintenance", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
    },
  },

  dagger: {
    name: "Dagger Fighting",
    description: "Small, pointy object. Learn how and where to poke things.",
    level: [],
    parent: "weapon_proficiency",
    milestones: {
      5:  [eff.xpMultiplier("pickpocketing", { percent: 0.05 })],
      10: [eff.xpMultiplier("ambushing", { percent: 0.05 })],
    },
  },

  axe: {
    name: "Axe Fighting",
    description: "Splitting limbs is easier than logs.",
    level: [],
    parent: "weapon_proficiency",
    milestones: {
      5:  [eff.xpMultiplier("woodcutting", { percent: 0.08 })],
      10: [eff.changeValue("staminaMax", 2)],
      15: [eff.xpMultiplier("strength", { percent: 0.03 })],
    },
  },

  spear: {
    name: "Spear Fighting",
    description: "A versatile and effective weapon. Keep your distance and poke.",
    level: [],
    parent: "weapon_proficiency",
    milestones: {
      5:  [eff.xpMultiplier("hunting", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
    },
  },

  shield: {
    name: "Shield Fighting",
    description: "You feel a lot safer with a big slab of metal between you and danger.",
    level: [],
    parent: "weapon_proficiency",
    milestones: {
      5:  [eff.changeValue("healthMax", 3)],
      10: [eff.changeValue("staminaMax", 3)],
    },
  },

  ranged: {
    name: "Ranged",
    description: "The art of accelerating objects towards a target.",
    level: [],
    parent: "combat",
    milestones: {
      5:  [eff.xpMultiplier("observation", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
      15: [eff.xpMultiplier("wit", { percent: 0.03 })],
    },
  },

  archery: {
    name: "Archery",
    description:
      "Use a bow to shoot an arrow. Surprisingly tricky, but effective. If you have arrows.",
    level: [],
    parent: "ranged",
    milestones: {
      5:  [eff.xpMultiplier("observation", { percent: 0.05 })],
      10: [eff.xpMultiplier("hunting", { percent: 0.05 })],
    },
  },

  throwing: {
    name: "Throwing",
    description:
      "Humanoid creatures are uniquely suited to throwing stuff. Exploit this advantage.",
    level: [],
    parent: "ranged",
    milestones: {
      5:  [eff.xpMultiplier("hunting", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
    },
  },

  unarmed: {
    name: "Unarmed",
    description: "Fight without using a weapon. You're not a cheater.",
    level: [],
    parent: "combat",
    milestones: {
      5:  [eff.xpMultiplier("regeneration", { percent: 0.05 })],
      10: [eff.changeStrength("health_regen", { percent: 0.05 })],
      15: [eff.xpMultiplier("wrestling", { percent: 0.08 })],
    },
  },

  grappling: {
    name: "Grappling",
    description: "Why would you let the opponent hit you? Just hold them in place, are you stupid?",
    level: [],
    parent: "unarmed",
    milestones: {
      5:  [eff.xpMultiplier("wrestling", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
    },
  },

  wrestling: {
    name: "Wrestling",
    description: "You know what this fight needs? Plotlines.",
    level: [],
    parent: "unarmed",
    milestones: {
      5:  [eff.xpMultiplier("grappling", { percent: 0.05 })],
      10: [eff.changeValue("healthMax", 2)],
    },
  },

  evasion: {
    name: "Evasion",
    description: "Why would you let the opponent hit you? Just move out the way, don't be stupid.",
    level: [eff.changeStrength("dodge_attack", { percent: 0.05 })],
    parent: "combat",
    milestones: {
      5:  [eff.xpMultiplier("agility", { percent: 0.03 })],
      10: [eff.changeValue("staminaMax", 3)],
      15: [eff.xpMultiplier("acrobatics", { percent: 0.05 })],
    },
  },
};
