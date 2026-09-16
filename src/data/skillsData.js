import { eff } from "../structures/structures.js";

export const SKILLS = {
  /*
  * Skill tree layout (top-level nodes only - see individual entries for children)
  *
  * Combat      - weapon_proficiency, ranged, unarmed, evasion
  * Resting     - meditation, sleeping
  * Training    - exercise, sparring
  * Traversal   - running, walking, climbing, swimming, parkour, acrobatics
  * Subterfuge  - sneaking, lockpicking, pickpocketing, ambushing
  * Survival    - tracking, navigation, trapping, riding, mountaineering
  * Labour      - hauling, knot_tying, gathering (-> woodcutting/harvesting/mining/fishing/hunting)
  * Crafting    - carpentry, smithing, cooking, stoneworking, engraving, jewelry_making,
  *               leatherworking, alchemy
  * Knowledge   - observation, anatomy, occultism, strategy, appraising
  * Social      - persuasion, negotiation, intimidation, storytelling
  *
  * Every parent node levels up from its children's xp
  */


  // Attribute skills to allow them to level up and apply effects based on level. Don't add milestones
  // The rendering code treats these as a special case
  // TODO - stop hardcoding in rendering code, use sel.tag("characteristic")

  constitution: {
    tags: ["characteristic"],
    name: "Constitution",
    level: [
      eff.changeValue("healthMax", 2),
    ],
  },
  strength: {
    tags: ["characteristic"],
    name: "Strength",
    level: [
      eff.changeValue("healthMax", 1),
      eff.changeValue("staminaMax", 1),
    ],
  },

  agility: {
    tags: ["characteristic"],
    name: "Agility",
    level: [
      eff.changeValue("staminaMax", 2),
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
    level: [],
    parent: "combat",
    milestones: {
      5:  [eff.xpMultiplier("agility", { percent: 0.03 })],
      10: [eff.changeValue("staminaMax", 3)],
      15: [eff.xpMultiplier("acrobatics", { percent: 0.05 })],
    },
  },


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
      15: [eff.changeStrength("climbing_height_gain", { percent: 0.05 })],
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


  // ── Labour ────────────────────────────────────────────────────────────

  labour: {
    name: "Labour",
    description: "Lorem ipsum.",
    level: [],
    milestones: {
      5:  [eff.changeValue("staminaMax", 3)],
      10: [eff.changeValue("healthMax", 3)],
      15: [eff.xpMultiplier("strength", { percent: 0.03 })],
    },
  },

  hauling: {
    name: "Hauling",
    description: "Carry heavy things from where they are to where they need to be.",
    level: [],
    parent: "labour",
    milestones: {
      5:  [eff.xpMultiplier("strength", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 3)],
      15: [eff.xpMultiplier("knot_tying", { percent: 0.05 })],
    },
  },

  knot_tying: {
    name: "Knot Tying",
    description: "There are hundreds of knots. You will actually use... about 4.",
    level: [],
    parent: "labour",
    milestones: {
      5:  [eff.xpMultiplier("hauling", { percent: 0.05 })],
      10: [eff.xpMultiplier("trapping", { percent: 0.05 })],
    },
  },

  gathering: {
    name: "Gathering",
    description: "So many things are just lying around. It's only stealing if someone owns it.",
    level: [],
    parent: "labour",
    milestones: {
      5:  [eff.changeValue("staminaMax", 3)],
      10: [eff.xpMultiplier("wit", { percent: 0.03 })],
      15: [eff.changeValue("staminaMax", 5)],
    },
  },

  woodcutting: {
    name: "Woodcutting",
    description: "Turn a tree into more, smaller trees.",
    level: [],
    parent: "gathering",
    milestones: {
      5:  [eff.xpMultiplier("axe", { percent: 0.08 })],
      10: [eff.changeValue("staminaMax", 2)],
      15: [eff.xpMultiplier("carpentry", { percent: 0.05 })],
    },
  },

  harvesting: {
    name: "Harvesting",
    description: "Pick things before they rot. Hopefully.",
    level: [],
    parent: "gathering",
    milestones: {
      5:  [eff.xpMultiplier("herbalism", { percent: 0.05 })],
      10: [eff.xpMultiplier("cooking", { percent: 0.05 })],
    },
  },

  herbalism: {
    name: "Herbalism",
    description: "Plants. Powerful plants. My plants, now.",
    level: [],
    parent: "harvesting",
    milestones: {
      5:  [eff.xpMultiplier("alchemy", { percent: 0.08 })],
      10: [eff.changeValue("mentalMax", 2)],
    },
  },

  mining: {
    name: "Mining",
    description: "Digging a big hole is it's own reward. Anything you find is just a bonus.",
    level: [],
    parent: "gathering",
    milestones: {
      5:  [eff.xpMultiplier("prospecting", { percent: 0.08 })],
      10: [eff.changeValue("healthMax", 2)],
      15: [eff.xpMultiplier("smithing", { percent: 0.05 })],
    },
  },

  prospecting: {
    name: "Prospecting",
    description: "Find the good rocks when digging a hole.",
    level: [],
    parent: "mining",
    milestones: {
      5:  [eff.xpMultiplier("mining", { percent: 0.05 })],
      10: [eff.xpMultiplier("jewelry_making", { percent: 0.05 })],
    },
  },

  fishing: {
    name: "Fishing",
    description: "Lorem ipsum.",
    level: [],
    parent: "gathering",
    milestones: {
      5:  [eff.xpMultiplier("cooking", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
    },
  },

  hunting: {
    name: "Hunting",
    description: "Gathering, if the ingredients could run away and sometimes fight back.",
    level: [],
    parent: "gathering",
    milestones: {
      5:  [eff.xpMultiplier("tracking", { percent: 0.05 })],
      10: [eff.xpMultiplier("butchery", { percent: 0.08 })],
      15: [eff.xpMultiplier("archery", { percent: 0.05 })],
    },
  },


  // ── Crafting ──────────────────────────────────────────────────────────

  crafting: {
    name: "Crafting",
    description: "Transform raw materials into something more useful. Hopefully.",
    level: [],
    milestones: {
      5:  [eff.changeValue("mentalMax", 3)],
      10: [eff.xpMultiplier("intelligence", { percent: 0.03 })],
      15: [eff.changeValue("staminaMax", 3)],
    },
  },

  carpentry: {
    name: "Carpentry",
    description: "Cut wood into smaller pieces and somehow end up with furniture.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("woodcutting", { percent: 0.05 })],
      10: [eff.xpMultiplier("engraving", { percent: 0.05 })],
    },
  },

  smithing: {
    name: "Smithing",
    description: "Turns out you're not actually meant to heat iron `red-hot`. Temper your expectations",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("mining", { percent: 0.05 })],
      10: [eff.xpMultiplier("weapon_maintenance", { percent: 0.05 })],
      15: [eff.xpMultiplier("armour_smithing", { percent: 0.05 })],
    },
  },

  weapon_maintenance: {
    name: "Weapon Maintenance",
    description: "It would be very embarrassing if your spear head fell off. Don't let that happen",
    level: [],
    parent: "smithing",
    milestones: {
      5:  [eff.xpMultiplier("weapon_proficiency", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
    },
  },

  armour_smithing: {
    name: "Armour Smithing",
    description: "Lorem ipsum.",
    level: [],
    parent: "smithing",
    milestones: {
      5:  [eff.xpMultiplier("smithing", { percent: 0.05 })],
      10: [eff.changeValue("healthMax", 3)],
    },
  },

  cooking: {
    name: "Cooking",
    description: "Improve food through the careful application of heat. Usually.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("harvesting", { percent: 0.05 })],
      10: [eff.xpMultiplier("butchery", { percent: 0.05 })],
      15: [eff.changeStrength("stamina_regen", { percent: 0.03 })],
    },
  },

  baking: {
    name: "Baking",
    description: "Cooking, but more science than art.",
    level: [],
    parent: "cooking",
    milestones: {
      5:  [eff.xpMultiplier("cooking", { percent: 0.05 })],
      10: [eff.changeValue("staminaMax", 2)],
    },
  },

  brewing: {
    name: "Brewing",
    description: "Turn perfectly good fruit into something far more interesting.",
    level: [],
    parent: "cooking",
    milestones: {
      5:  [eff.xpMultiplier("herbalism", { percent: 0.05 })],
      10: [eff.changeValue("mentalMax", 2)],
    },
  },

  butchery: {
    name: "Butchery",
    description: "Lorem ipsum.",
    level: [],
    parent: "cooking",
    milestones: {
      5:  [eff.xpMultiplier("hunting", { percent: 0.05 })],
      10: [eff.xpMultiplier("leatherworking", { percent: 0.05 })],
    },
  },

  stoneworking: {
    name: "Stoneworking",
    description: "Lorem ipsum.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("mining", { percent: 0.05 })],
      10: [eff.xpMultiplier("engraving", { percent: 0.05 })],
      15: [eff.changeValue("healthMax", 2)],
    },
  },

  engraving: {
    name: "Engraving",
    description: "Lorem ipsum.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("observation", { percent: 0.05 })],
      10: [eff.xpMultiplier("jewelry_making", { percent: 0.05 })],
    },
  },

  jewelry_making: {
    name: "Jewelry Making",
    description: "Lorem ipsum.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("prospecting", { percent: 0.05 })],
      10: [eff.xpMultiplier("appraising", { percent: 0.05 })],
    },
  },

  leatherworking: {
    name: "Leatherworking",
    description: "Lorem ipsum.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("butchery", { percent: 0.05 })],
      10: [eff.changeValue("healthMax", 2)],
    },
  },

  alchemy: {
    name: "Alchemy",
    description: "Chemistry that occasionally explodes, but in a useful and interesting way.",
    level: [],
    parent: "crafting",
    milestones: {
      5:  [eff.xpMultiplier("herbalism", { percent: 0.05 })],
      10: [eff.xpMultiplier("poisoncraft", { percent: 0.08 })],
      15: [eff.changeValue("mentalMax", 3)],
    },
  },

  poisoncraft: {
    name: "Poisoncraft",
    description: "The line between medicine and poison is mostly dosage, and you're getting good at dosage.",
    level: [],
    parent: "alchemy",
    milestones: {
      5:  [eff.xpMultiplier("alchemy", { percent: 0.05 })],
      10: [eff.xpMultiplier("dagger", { percent: 0.05 })],
    },
  },


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

/*
Skill Ideas - deferred (not final)

- Aikido / Bodybuilding / Aerobics / Calisthenics / Athletics
- Stealthing / Foraging / Blacksmithing / Metalworking / Stone Masonry / Horseback Riding
- Taming / Scavenging / Bird Watching
- Literacy / Reading / Writing / Astronomy / Teaching
- Geology
- Bartering / Sarcasm / Ventriloquism
- Drinking / Gambling / Painting / Weaving / Sewing / Taxidermy / Caber Tossing
*/

};