import { eff } from "../structures/structures.js";



export const SKILLS = {
  // Attribute skills to allow them to level up and apply effects based on level.
  // Don't add milestones
  // The rendering code treats them as a special case
  strength: {
    tags: ["characteristic"],
    name: "Strength",
    level: [
      eff.changeValue("healthMax", 1),
      eff.changeValue("staminaMax", 1),
    ], 
  },
  constitution: {
    tags: ["characteristic"],
    name: "Constitution",
    level: [
      eff.changeValue("healthMax", 2),
    ], 
  },
  agility: {
    tags: ["characteristic"],
    name: "Agility",
    level: [
      eff.changeValue("staminaMax", 2),
    ], 
  },
  dexterity: {
    tags: ["characteristic"],
    name: "Dexterity",
    level: [
    ], 
  },
  intelligence: {
    tags: ["characteristic"],
    name: "Intelligence",
    level: [
      eff.changeValue("mentalMax", 2),
    ], 
  },
  willpower: {
    tags: ["characteristic"],
    name: "Willpower",
    level: [
      eff.changeValue("healthMax", 1),
      eff.changeValue("mentalMax", 1),
    ], 
  },
  wit: {
    tags: ["characteristic"],
    name: "Wit",
    level: [
      eff.changeValue("staminaMax", 1),
      eff.changeValue("mentalMax", 1),
    ], 
  },
  perception: {
    tags: ["characteristic"],
    name: "Perception",
    level: [
    ], 
  },

  recovery: {
    name: "Recovery",
    description:
      "Restore yourself to peak condition. What almost kills you makes you stronger.",
    level: [],
  },
  regeneration: {
    name: "Regeneration",
    description:
      "If you keep getting hurt, your body learns to heal faster. Thats how it works.",
    level: [eff.changeConditionStrength("health_regen", {percent: 0.1})],
    parent: "recovery",
  },

  breathing: {
    name: "Breathing",
    description:
      "You're breathing wrong. In through the nose. Bring air down to the belly. Out through the mouth.",
    level: [eff.changeConditionStrength("stamina_regen", {percent: 0.1})],
    parent: "recovery",
  },

  mindfulness: {
    name: "Mindfulness",
    description:
      "Become more aware of your mental state, whats affecting it, and how to improve it.",
    level: [eff.changeConditionStrength("mental_regen", {percent: 0.1})],
    parent: "recovery",
  },

  combat: {
    name: "Combat",
    description: "Pit your mind and body against another in battle.",
    level: [],
  },

  weapon_proficiency: {
    name: "Weapon Proficiency",
    description:
      "Mastery of melee weapons. Wield them as an extension of your body.",
    level: [],
  },

  club: {
    name: "Club Fighting",
    description:
      "A hammer. A stick. The closest rock. The first weapon ever used, and it holds up today.",
    level: [],
    parent: "weapon_proficiency",
  },

  sword: {
    name: "Sword Fighting",
    description: "A tool of war.",
    level: [],
    parent: "weapon_proficiency",
  },

  dagger: {
    name: "Dagger Fighting",
    description: "Small, pointy object. Learn how and where to poke things.",
    level: [],
    parent: "weapon_proficiency",
  },

  axe: {
    name: "Axe Fighting",
    description: "Splitting limbs is easier than logs.",
    level: [],
    parent: "weapon_proficiency",
  },

  spear: {
    name: "Spear Fighting",
    description:
      "A versatile and effective weapon. Keep your distance and poke.",
    level: [],
    parent: "weapon_proficiency",
  },

  ranged: {
    name: "Ranged",
    description: "The art of accelerating objects towards a target.",
    level: [],
    parent: "combat",
  },

  archery: {
    name: "Archery",
    description:
      "Use a bow to shoot an arrow. Surprisingly tricky, but effective. If you have arrows.",
    level: [],
    parent: "ranged",
  },

  throwing: {
    name: "Throwing",
    description:
      "Humanoid creatures are uniquely suited to throwing stuff. Exploit this advantage.",
    level: [],
    parent: "ranged",
  },

  unarmed: {
    name: "Unarmed",
    description: "Fight without using a weapon. You're not a cheater.",
    level: [],
    parent: "combat",
  },

  resting: {
    name: "Resting",
    description: "Do nothing. Faster.",
    level: [],
  },

  meditation: {
    name: "Meditation",
    description:
      "Clear your mind and relax. Nobody can agree on what exactly it means to meditate, but whatever you're doing seems to help.",
    level: [],
    parent: "resting",
  },

  sleeping: {
    name: "Sleeping",
    description:
      "Learn to sleep better, because everything's a skill. Get more from your shut-eye.",
    level: [],
    parent: "resting",
  },

  training: {
    name: "Training",
    description:
      "Get stronger without risking your life, a revolutionary concept.",
    level: [],
  },

  exercise: {
    name: "Exercise",
    description:
      "Expend physical effort without any clear goal or reward. A luxurious pastime.",
    level: [],
    parent: "training",
  },

  sparring: {
    name: "Sparring",
    description:
      "Fight your friends in a friendly way. Don't go for the kill. Avoid maiming.",
    level: [],
    parent: "training",
  },

  traversal: {
    name: "Traversal",
    description: "Move from point A to point B. Do it faster.",
    level: [],
  },

  running: {
    name: "Running",
    description:
      "Run, run, as fast as you can. Maybe it'll save your life someday",
    level: [],
    parent: "traversal",
  },

  walking: {
    name: "Walking",
    description:
      "The difference between a lovely stroll and miserable slog is a thin line. Use the line to lace your boots.",
    level: [],
    parent: "traversal",
  },

  climbing: {
    name: "Climbing",
    description:
      "Learn how to cling to a vertical surface without exhausting yourself.",
    level: [],
    parent: "traversal",
  },

  labour: {
    name: "Labour",
    level: [],
  },

  hauling: {
    name: "Hauling",
    level: [],
    parent: "labour",
  },

  gathering: {
    name: "Gathering",
    level: [],
    parent: "labour",
  },

  woodcutting: {
    name: "Woodcutting",
    level: [],
    parent: "gathering",
  },

  harvesting: {
    name: "Harvesting",
    level: [],
    parent: "gathering",
  },

  mining: {
    name: "Mining",
    level: [],
    parent: "gathering",
  },

  fishing: {
    name: "Fishing",
    description:
      "Convince a creature with a brain the size of a pebble to let you grab it from the water.",
    level: [],
    parent: "gathering",
  },

  crafting: {
    name: "Crafting",
    description:
      "Transform raw materials into something more useful. Hopefully.",
    level: [],
  },

  carpentry: {
    name: "Carpentry",
    description:
      "Cut wood into smaller pieces and somehow end up with furniture.",
    level: [],
    parent: "crafting",
  },

  stoneworking: {
    name: "Stoneworking",
    description: "Rock is stubborn. Be more stubborn.",
    level: [],
    parent: "crafting",
  },

  smithing: {
    name: "Smithing",
    description:
      "Turns out you're not actually meant to heat iron `red-hot`. Temper your expectations",
    level: [],
    parent: "crafting",
  },

  cooking: {
    name: "Cooking",
    description:
      "Improve food through the careful application of heat. Usually.",
    level: [],
    parent: "crafting",
  },
};
