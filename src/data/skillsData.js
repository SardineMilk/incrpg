import { eff } from "../structures/effectDefs.js";


export const SKILLS = {
  // Attribute skills to allow them to level up and apply effects based on level.
  // Don't add milestones
  // The rendering code treats them as a special case
  strength: { 
    name: "Strength",
    level: [
      eff.changeResourceMax("health", 0.5),
      eff.changeResourceMax("stamina", 0.5),
    ], 
  },
  constitution: { 
    name: "Constitution",
    level: [
      eff.changeResourceMax("health", 1),
    ], 
  },
  agility: { 
    name: "Agility",
    level: [
      eff.changeResourceMax("stamina", 1),
    ], 
  },
  dexterity: { 
    name: "Dexterity",
    level: [
    ], 
  },
  intelligence: { 
    name: "Intelligence",
    level: [
      eff.changeResourceMax("mental", 1),
    ], 
  },
  willpower: { 
    name: "Willpower",
    level: [
      eff.changeResourceMax("health", 0.5),
      eff.changeResourceMax("mental", 0.5),
    ], 
  },
  wit: { 
    name: "Wit",
    level: [
      eff.changeResourceMax("stamina", 0.5),
      eff.changeResourceMax("mental", 0.5),
    ], 
  },
  perception: { 
    name: "Perception",
    level: [
    ], 
  },

  combat: {
    name: "Combat",
    description: "Pit your mind and body against another in battle.",
    level: [],
    parent: null,
    milestones: {
      5: [
        eff.skillLevelBonus("strength", 1, 0),
        eff.skillLevelBonus("constitution", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("combat", 0.1),
        eff.skillLevelBonus("perception", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.skillLevelBonus("constitution", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("combat", 0.2),
        eff.skillLevelBonus("willpower", 2, 0),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.2),
        eff.skillLevelBonus("constitution", 0, 1.2),
        eff.changeConditionStrength("fear", -0.3),
      ],
    },
  },

  weapon_proficiency: {
    name: "Weapon Proficiency",
    description:
      "Mastery of melee weapons. Wield them as an extension of your body.",
    level: [],
    parent: null,
    milestones: {
      5: [eff.skillLevelBonus("dexterity", 1, 0)],
      10: [eff.skillXpMultiplier("weapon_proficiency", 0.1)],
      20: [
        eff.skillLevelBonus("agility", 0, 1.1),
        eff.skillLevelBonus("dexterity", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("weapon_proficiency", 0.2),
        eff.skillLevelBonus("strength", 1, 0),
      ],
      80: [
        eff.skillLevelBonus("dexterity", 0, 1.2),
        eff.changeConditionStrength("off_balance", -0.25),
      ],
    },
  },

  club: {
    name: "Club Fighting",
    description:
      "A stick. A hammer. The closest rock. The first weapon ever used, and it holds up today.",
    level: [],
    parent: "weapon_proficiency",
    milestones: {
      5: [eff.skillLevelBonus("strength", 1, 0)],
      10: [
        eff.skillXpMultiplier("club", 0.15),
        eff.grantSkillXp("weapon_proficiency", 20),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.changeConditionStrength("stunned", 0.1),
      ],
      40: [
        eff.skillXpMultiplier("club", 0.2),
        eff.skillLevelBonus("constitution", 1, 0),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.25),
        eff.changeConditionStrength("stunned", 0.2),
        eff.changeConditionStrength("dazed", 0.15),
      ],
    },
  },

  sword: {
    name: "Sword Fighting",
    description: "A tool of war.",
    level: [],
    parent: "weapon_proficiency",
    milestones: {
      5: [eff.skillLevelBonus("dexterity", 1, 0)],
      10: [
        eff.skillXpMultiplier("sword", 0.15),
        eff.skillLevelBonus("agility", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("dexterity", 0, 1.1),
        eff.skillLevelBonus("agility", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("sword", 0.2),
        eff.changeConditionStrength("bleeding", 0.1),
      ],
      80: [
        eff.skillLevelBonus("dexterity", 0, 1.25),
        eff.skillLevelBonus("perception", 0, 1.1),
        eff.changeConditionStrength("bleeding", 0.2),
      ],
    },
  },

  dagger: {
    name: "Dagger Fighting",
    description: "Small, pointy object. Learn how and where to poke things.",
    level: [],
    parent: "weapon_proficiency",
    milestones: {
      5: [eff.skillLevelBonus("dexterity", 1, 0)],
      10: [
        eff.skillXpMultiplier("dagger", 0.15),
        eff.skillLevelBonus("agility", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("dexterity", 0, 1.15),
        eff.grantSkillXp("perception", 30),
      ],
      40: [
        eff.skillXpMultiplier("dagger", 0.2),
        eff.changeConditionStrength("bleeding", 0.15),
      ],
      80: [
        eff.skillLevelBonus("dexterity", 0, 1.3),
        eff.changeConditionStrength("bleeding", 0.25),
        eff.changeConditionStrength("poisoned", 0.1),
      ],
    },
  },

  axe: {
    name: "Axe Fighting",
    description: "Splitting limbs is easier than logs.",
    level: [],
    parent: "weapon_proficiency",
    milestones: {
      5: [eff.skillLevelBonus("strength", 1, 0)],
      10: [
        eff.skillXpMultiplier("axe", 0.15),
        eff.grantSkillXp("woodcutting", 25),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.skillLevelBonus("constitution", 1, 0),
      ],
      40: [
        eff.skillXpMultiplier("axe", 0.2),
        eff.changeConditionStrength("bleeding", 0.2),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.25),
        eff.changeConditionStrength("bleeding", 0.3),
        eff.skillLevelBonus("constitution", 0, 1.1),
      ],
    },
  },

  spear: {
    name: "Spear Fighting",
    description:
      "A versatile and effective weapon. Keep your distance and poke.",
    level: [],
    parent: "weapon_proficiency",
    milestones: {
      5: [eff.skillLevelBonus("perception", 1, 0)],
      10: [
        eff.skillXpMultiplier("spear", 0.15),
        eff.skillLevelBonus("agility", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("perception", 0, 1.1),
        eff.skillLevelBonus("agility", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("spear", 0.2),
        eff.grantSkillXp("throwing", 40),
      ],
      80: [
        eff.skillLevelBonus("perception", 0, 1.2),
        eff.skillLevelBonus("agility", 0, 1.15),
        eff.changeConditionStrength("off_balance", -0.2),
      ],
    },
  },

  ranged: {
    name: "Ranged",
    description: "The art of accelerating objects towards a target.",
    level: [],
    parent: "combat",
    milestones: {
      5: [
        eff.skillLevelBonus("perception", 1, 0),
        eff.skillLevelBonus("dexterity", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("ranged", 0.1),
        eff.skillLevelBonus("perception", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("perception", 0, 1.1),
        eff.skillLevelBonus("dexterity", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("ranged", 0.2),
        eff.skillLevelBonus("wit", 1, 0),
      ],
      80: [
        eff.skillLevelBonus("perception", 0, 1.2),
        eff.skillLevelBonus("dexterity", 0, 1.15),
        eff.changeConditionStrength("calm", 0.1),
      ],
    },
  },

  archery: {
    name: "Archery",
    description:
      "Use a bow to shoot an arrow. Surprisingly tricky, but effective. If you have arrows.",
    level: [],
    parent: "ranged",
    milestones: {
      5: [eff.skillLevelBonus("dexterity", 1, 0)],
      10: [
        eff.skillXpMultiplier("archery", 0.15),
        eff.skillLevelBonus("perception", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("dexterity", 0, 1.1),
        eff.skillLevelBonus("strength", 1, 0),
      ],
      40: [
        eff.skillXpMultiplier("archery", 0.2),
        eff.changeConditionStrength("bleeding", 0.1),
        eff.skillLevelBonus("perception", 0, 1.1),
      ],
      80: [
        eff.skillLevelBonus("dexterity", 0, 1.25),
        eff.skillLevelBonus("perception", 0, 1.2),
        eff.changeConditionStrength("calm", 0.15),
      ],
    },
  },

  throwing: {
    name: "Throwing",
    description:
      "Humanoid creatures are uniquely suited to throwing stuff. Exploit this advantage.",
    level: [],
    parent: "ranged",
    milestones: {
      5: [
        eff.skillLevelBonus("strength", 1, 0),
        eff.skillLevelBonus("dexterity", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("throwing", 0.15),
        eff.grantSkillXp("spear", 20),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.skillLevelBonus("agility", 1, 0),
      ],
      40: [
        eff.skillXpMultiplier("throwing", 0.2),
        eff.skillLevelBonus("dexterity", 0, 1.1),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.15),
        eff.skillLevelBonus("dexterity", 0, 1.2),
        eff.changeConditionStrength("stunned", 0.1),
      ],
    },
  },

  unarmed: {
    name: "Unarmed",
    description: "Fight without using a weapon. You're not a cheater.",
    level: [],
    parent: "combat",
    milestones: {
      5: [
        eff.skillLevelBonus("strength", 1, 0),
        eff.skillLevelBonus("agility", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("unarmed", 0.1),
        eff.skillLevelBonus("constitution", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.skillLevelBonus("agility", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("unarmed", 0.2),
        eff.skillLevelBonus("dexterity", 0, 1.1),
        eff.changeConditionStrength("stunned", 0.15),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.2),
        eff.skillLevelBonus("agility", 0, 1.2),
        eff.changeConditionStrength("fear", -0.2),
        eff.changeConditionStrength("stunned", 0.2),
      ],
    },
  },

  recovery: {
    name: "Recovery",
    description:
      "Restore yourself to peak condition. Should you be proud of this skill?",
    level: [],
    parent: null,
    milestones: {
      5: [eff.skillLevelBonus("constitution", 1, 0)],
      10: [
        eff.skillXpMultiplier("recovery", 0.1),
        eff.skillLevelBonus("willpower", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("constitution", 0, 1.1),
        eff.changeConditionTagStrength("injury", -0.1),
      ],
      40: [
        eff.skillXpMultiplier("recovery", 0.2),
        eff.changeConditionTagStrength("injury", -0.15),
        eff.skillLevelBonus("constitution", 0, 1.15),
      ],
      80: [
        eff.skillLevelBonus("constitution", 0, 1.25),
        eff.changeConditionTagStrength("injury", -0.25),
        eff.changeConditionTagStrength("illness", -0.2),
      ],
    },
  },

  regeneration: {
    name: "Regeneration",
    description:
      "If you keep getting hurt, your body learns to heal faster. Thats how it works.",
    level: [],
    parent: "recovery",
    milestones: {
      5: [eff.skillLevelBonus("constitution", 1, 0)],
      10: [
        eff.skillXpMultiplier("regeneration", 0.15),
        eff.changeConditionStrength("bleeding", -0.1),
      ],
      20: [
        eff.skillLevelBonus("constitution", 0, 1.1),
        eff.changeConditionTagStrength("injury", -0.1),
      ],
      40: [
        eff.skillXpMultiplier("regeneration", 0.2),
        eff.changeConditionTagStrength("injury", -0.15),
        eff.changeConditionStrength("bleeding", -0.2),
      ],
      80: [
        eff.skillLevelBonus("constitution", 0, 1.25),
        eff.changeConditionTagStrength("injury", -0.3),
        eff.changeConditionStrength("bleeding", -0.3),
      ],
    },
  },

  breathing: {
    name: "Breathing",
    description:
      "You're breathing wrong. In through the nose. Bring air down to the belly. Out through the mouth.",
    level: [],
    parent: "recovery",
    milestones: {
      5: [eff.skillLevelBonus("constitution", 1, 0)],
      10: [
        eff.skillXpMultiplier("breathing", 0.15),
        eff.skillLevelBonus("willpower", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("constitution", 0, 1.1),
        eff.changeConditionStrength("winded", -0.2),
      ],
      40: [
        eff.skillXpMultiplier("breathing", 0.2),
        eff.changeConditionStrength("winded", -0.3),
        eff.grantSkillXp("meditation", 30),
      ],
      80: [
        eff.skillLevelBonus("constitution", 0, 1.2),
        eff.skillLevelBonus("willpower", 0, 1.1),
        eff.changeConditionStrength("winded", -0.4),
        eff.changeConditionStrength("panicking", -0.25),
      ],
    },
  },

  mindfulness: {
    name: "Mindfulness",
    description:
      "Become more aware of your mental state, whats affecting it, and how to improve it.",
    level: [],
    parent: "recovery",
    milestones: {
      5: [
        eff.skillLevelBonus("willpower", 1, 0),
        eff.skillLevelBonus("perception", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("mindfulness", 0.15),
        eff.grantSkillXp("meditation", 20),
      ],
      20: [
        eff.skillLevelBonus("willpower", 0, 1.1),
        eff.changeConditionTagStrength("mental", -0.1),
      ],
      40: [
        eff.skillXpMultiplier("mindfulness", 0.2),
        eff.changeConditionTagStrength("mental", -0.2),
        eff.skillLevelBonus("perception", 0, 1.1),
      ],
      80: [
        eff.skillLevelBonus("willpower", 0, 1.25),
        eff.changeConditionTagStrength("mental", -0.3),
        eff.changeConditionStrength("fear", -0.3),
        eff.changeConditionStrength("despair", -0.25),
      ],
    },
  },

  resting: {
    name: "Resting",
    description: "Do nothing. Faster.",
    level: [],
    parent: null,
    milestones: {
      5: [eff.skillLevelBonus("constitution", 1, 0)],
      10: [
        eff.skillXpMultiplier("resting", 0.1),
        eff.skillLevelBonus("willpower", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("constitution", 0, 1.1),
        eff.changeConditionTagStrength("fatigue", -0.1),
      ],
      40: [
        eff.skillXpMultiplier("resting", 0.15),
        eff.changeConditionTagStrength("fatigue", -0.2),
        eff.changeConditionTagStrength("injury", -0.1),
      ],
      80: [
        eff.skillLevelBonus("constitution", 0, 1.2),
        eff.changeConditionTagStrength("fatigue", -0.3),
        eff.changeConditionTagStrength("illness", -0.15),
        eff.changeConditionTagStrength("mental", -0.1),
      ],
    },
  },

  meditation: {
    name: "Meditation",
    description:
      "Clear your mind and relax. Nobody can agree on what exactly it means to meditate, but whatever you're doing seems to help.",
    level: [],
    parent: "resting",
    milestones: {
      5: [eff.skillLevelBonus("willpower", 1, 0)],
      10: [
        eff.skillXpMultiplier("meditation", 0.15),
        eff.skillLevelBonus("intelligence", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("willpower", 0, 1.1),
        eff.changeConditionTagStrength("mental", -0.15),
      ],
      40: [
        eff.skillXpMultiplier("meditation", 0.2),
        eff.skillLevelBonus("willpower", 0, 1.1),
        eff.changeConditionStrength("fear", -0.2),
      ],
      80: [
        eff.skillLevelBonus("willpower", 0, 1.3),
        eff.changeConditionTagStrength("mental", -0.3),
        eff.changeConditionStrength("fear", -0.35),
        eff.changeConditionStrength("despair", -0.3),
      ],
    },
  },

  sleeping: {
    name: "Sleeping",
    description:
      "Learn to sleep better, because everything's a skill. Get more from your shut-eye.",
    level: [],
    parent: "resting",
    milestones: {
      5: [eff.skillLevelBonus("constitution", 1, 0)],
      10: [
        eff.skillXpMultiplier("sleeping", 0.15),
        eff.changeConditionTagStrength("fatigue", -0.15),
      ],
      20: [
        eff.skillLevelBonus("constitution", 0, 1.1),
        eff.skillLevelBonus("willpower", 1, 0),
        eff.changeConditionTagStrength("fatigue", -0.1),
      ],
      40: [
        eff.skillXpMultiplier("sleeping", 0.2),
        eff.changeConditionTagStrength("fatigue", -0.2),
        eff.changeConditionTagStrength("injury", -0.1),
      ],
      80: [
        eff.skillLevelBonus("constitution", 0, 1.2),
        eff.changeConditionTagStrength("fatigue", -0.35),
        eff.changeConditionTagStrength("illness", -0.2),
        eff.changeConditionTagStrength("injury", -0.15),
      ],
    },
  },

  training: {
    name: "Training",
    description:
      "Get stronger without risking your life, a revolutionary concept.",
    level: [],
    parent: null,
    milestones: {
      5: [
        eff.skillLevelBonus("strength", 1, 0),
        eff.skillLevelBonus("constitution", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("training", 0.1),
        eff.skillLevelBonus("agility", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.skillLevelBonus("constitution", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("training", 0.15),
        eff.changeConditionTagStrength("fatigue", -0.1),
        eff.skillLevelBonus("willpower", 1, 0),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.2),
        eff.skillLevelBonus("constitution", 0, 1.2),
        eff.skillLevelBonus("willpower", 0, 1.1),
        eff.changeConditionTagStrength("fatigue", -0.15),
      ],
    },
  },

  exercise: {
    name: "Exercise",
    description:
      "Expend physical effort without any clear goal or reward. A luxurious pastime.",
    level: [],
    parent: "training",
    milestones: {
      5: [
        eff.skillLevelBonus("constitution", 1, 0),
        eff.skillLevelBonus("strength", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("exercise", 0.15),
        eff.grantSkillXp("running", 20),
      ],
      20: [
        eff.skillLevelBonus("constitution", 0, 1.1),
        eff.skillLevelBonus("agility", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("exercise", 0.2),
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.changeConditionTagStrength("fatigue", -0.1),
      ],
      80: [
        eff.skillLevelBonus("constitution", 0, 1.2),
        eff.skillLevelBonus("strength", 0, 1.15),
        eff.skillLevelBonus("agility", 0, 1.15),
        eff.changeConditionTagStrength("illness", -0.1),
      ],
    },
  },

  sparring: {
    name: "Sparring",
    description:
      "Fight your friends in a friendly way. Don't go for the kill. Avoid maiming.",
    level: [],
    parent: "training",
    milestones: {
      5: [
        eff.skillLevelBonus("agility", 1, 0),
        eff.skillLevelBonus("dexterity", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("sparring", 0.1),
        eff.grantSkillXp("combat", 30),
      ],
      20: [
        eff.skillLevelBonus("agility", 0, 1.1),
        eff.skillXpMultiplier("combat", 0.05),
      ],
      40: [
        eff.skillXpMultiplier("sparring", 0.15),
        eff.skillXpMultiplier("combat", 0.1),
        eff.skillLevelBonus("perception", 1, 0),
      ],
      80: [
        eff.skillLevelBonus("agility", 0, 1.2),
        eff.skillLevelBonus("dexterity", 0, 1.1),
        eff.skillXpMultiplier("combat", 0.15),
        eff.changeConditionStrength("fear", -0.15),
      ],
    },
  },

  traversal: {
    name: "Traversal",
    description: "Move from point A to point B. Do it faster.",
    level: [],
    parent: null,
    milestones: {
      5: [
        eff.skillLevelBonus("agility", 1, 0),
        eff.skillLevelBonus("constitution", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("traversal", 0.1),
        eff.skillLevelBonus("agility", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("agility", 0, 1.1),
        eff.skillLevelBonus("constitution", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("traversal", 0.15),
        eff.skillLevelBonus("agility", 0, 1.1),
        eff.changeConditionTagStrength("fatigue", -0.1),
      ],
      80: [
        eff.skillLevelBonus("agility", 0, 1.25),
        eff.skillLevelBonus("constitution", 0, 1.15),
        eff.changeConditionTagStrength("fatigue", -0.2),
      ],
    },
  },

  running: {
    name: "Running",
    description:
      "Run, run, as fast as you can. Maybe it'll save your life someday",
    level: [],
    parent: "traversal",
    milestones: {
      5: [eff.skillLevelBonus("agility", 1, 0)],
      10: [
        eff.skillXpMultiplier("running", 0.15),
        eff.skillLevelBonus("constitution", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("agility", 0, 1.1),
        eff.changeConditionStrength("winded", -0.15),
      ],
      40: [
        eff.skillXpMultiplier("running", 0.2),
        eff.skillLevelBonus("agility", 0, 1.1),
        eff.changeConditionStrength("winded", -0.2),
      ],
      80: [
        eff.skillLevelBonus("agility", 0, 1.3),
        eff.skillLevelBonus("constitution", 0, 1.15),
        eff.changeConditionStrength("winded", -0.35),
        eff.changeConditionTagStrength("fatigue", -0.1),
      ],
    },
  },

  walking: {
    name: "Walking",
    description:
      "The difference between a lovely stroll and miserable slog is a thin line. Use the line to lace your boots.",
    level: [],
    parent: "traversal",
    milestones: {
      5: [eff.skillLevelBonus("constitution", 1, 0)],
      10: [
        eff.skillXpMultiplier("walking", 0.15),
        eff.skillLevelBonus("agility", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("constitution", 0, 1.1),
        eff.changeConditionTagStrength("fatigue", -0.1),
      ],
      40: [
        eff.skillXpMultiplier("walking", 0.2),
        eff.skillLevelBonus("constitution", 0, 1.1),
        eff.changeConditionTagStrength("fatigue", -0.15),
      ],
      80: [
        eff.skillLevelBonus("constitution", 0, 1.2),
        eff.skillLevelBonus("agility", 0, 1.1),
        eff.changeConditionTagStrength("fatigue", -0.25),
        eff.changeConditionStrength("winded", -0.2),
      ],
    },
  },

  climbing: {
    name: "Climbing",
    description:
      "Learn how to cling to a vertical surface without exhausting yourself.",
    level: [],
    parent: "traversal",
    milestones: {
      5: [
        eff.skillLevelBonus("strength", 1, 0),
        eff.skillLevelBonus("dexterity", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("climbing", 0.15),
        eff.skillLevelBonus("agility", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.skillLevelBonus("dexterity", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("climbing", 0.2),
        eff.skillLevelBonus("agility", 0, 1.1),
        eff.changeConditionStrength("winded", -0.15),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.2),
        eff.skillLevelBonus("dexterity", 0, 1.2),
        eff.skillLevelBonus("agility", 0, 1.1),
        eff.changeConditionStrength("winded", -0.25),
      ],
    },
  },

  labour: {
    name: "Labour",
    level: [],
    parent: null,
    milestones: {
      5: [
        eff.skillLevelBonus("strength", 1, 0),
        eff.skillLevelBonus("constitution", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("labour", 0.1),
        eff.skillLevelBonus("strength", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.skillLevelBonus("constitution", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("labour", 0.15),
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.changeConditionTagStrength("fatigue", -0.1),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.25),
        eff.skillLevelBonus("constitution", 0, 1.2),
        eff.changeConditionTagStrength("fatigue", -0.2),
      ],
    },
  },

  hauling: {
    name: "Hauling",
    level: [],
    parent: "labour",
    milestones: {
      5: [eff.skillLevelBonus("strength", 1, 0)],
      10: [
        eff.skillXpMultiplier("hauling", 0.15),
        eff.skillLevelBonus("constitution", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.changeConditionStrength("encumbered", -0.15),
      ],
      40: [
        eff.skillXpMultiplier("hauling", 0.2),
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.changeConditionStrength("encumbered", -0.25),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.3),
        eff.skillLevelBonus("constitution", 0, 1.15),
        eff.changeConditionStrength("encumbered", -0.35),
        eff.changeConditionTagStrength("fatigue", -0.1),
      ],
    },
  },

  gathering: {
    name: "Gathering",
    level: [],
    parent: "labour",
    milestones: {
      5: [eff.skillLevelBonus("perception", 1, 0)],
      10: [
        eff.skillXpMultiplier("gathering", 0.1),
        eff.skillLevelBonus("wit", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("perception", 0, 1.1),
        eff.skillXpMultiplier("gathering", 0.1),
      ],
      40: [
        eff.skillXpMultiplier("gathering", 0.15),
        eff.skillLevelBonus("wit", 0, 1.1),
        eff.skillLevelBonus("perception", 0, 1.1),
      ],
      80: [
        eff.skillLevelBonus("perception", 0, 1.2),
        eff.skillLevelBonus("wit", 0, 1.15),
        eff.skillXpMultiplier("gathering", 0.2),
      ],
    },
  },

  woodcutting: {
    name: "Woodcutting",
    level: [],
    parent: "gathering",
    milestones: {
      5: [eff.skillLevelBonus("strength", 1, 0)],
      10: [
        eff.skillXpMultiplier("woodcutting", 0.15),
        eff.grantSkillXp("axe", 25),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.skillLevelBonus("constitution", 1, 0),
      ],
      40: [
        eff.skillXpMultiplier("woodcutting", 0.2),
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.grantSkillXp("carpentry", 30),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.25),
        eff.skillLevelBonus("constitution", 0, 1.1),
        eff.skillXpMultiplier("carpentry", 0.1),
      ],
    },
  },

  harvesting: {
    name: "Harvesting",
    level: [],
    parent: "gathering",
    milestones: {
      5: [eff.skillLevelBonus("perception", 1, 0)],
      10: [
        eff.skillXpMultiplier("harvesting", 0.15),
        eff.skillLevelBonus("dexterity", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("perception", 0, 1.1),
        eff.grantSkillXp("cooking", 20),
      ],
      40: [
        eff.skillXpMultiplier("harvesting", 0.2),
        eff.skillLevelBonus("dexterity", 0, 1.1),
        eff.skillLevelBonus("perception", 0, 1.1),
      ],
      80: [
        eff.skillLevelBonus("perception", 0, 1.2),
        eff.skillLevelBonus("dexterity", 0, 1.15),
        eff.skillXpMultiplier("cooking", 0.1),
      ],
    },
  },

  mining: {
    name: "Mining",
    level: [],
    parent: "gathering",
    milestones: {
      5: [
        eff.skillLevelBonus("strength", 1, 0),
        eff.skillLevelBonus("perception", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("mining", 0.15),
        eff.skillLevelBonus("constitution", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.grantSkillXp("smithing", 30),
      ],
      40: [
        eff.skillXpMultiplier("mining", 0.2),
        eff.skillLevelBonus("perception", 0, 1.1),
        eff.skillLevelBonus("strength", 0, 1.1),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.25),
        eff.skillLevelBonus("constitution", 0, 1.1),
        eff.skillXpMultiplier("smithing", 0.1),
        eff.skillXpMultiplier("stoneworking", 0.1),
      ],
    },
  },

  fishing: {
    name: "Fishing",
    description:
      "Convince a creature with a brain the size of a pebble to let you grab it from the water.",
    level: [],
    parent: "gathering",
    milestones: {
      5: [eff.skillLevelBonus("perception", 1, 0)],
      10: [
        eff.skillXpMultiplier("fishing", 0.15),
        eff.skillLevelBonus("wit", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("perception", 0, 1.1),
        eff.changeConditionTagStrength("mental", -0.1),
      ],
      40: [
        eff.skillXpMultiplier("fishing", 0.2),
        eff.skillLevelBonus("wit", 0, 1.1),
        eff.grantSkillXp("cooking", 30),
      ],
      80: [
        eff.skillLevelBonus("perception", 0, 1.2),
        eff.skillLevelBonus("wit", 0, 1.15),
        eff.changeConditionTagStrength("mental", -0.2),
        eff.skillXpMultiplier("cooking", 0.1),
      ],
    },
  },

  crafting: {
    name: "Crafting",
    description:
      "Transform raw materials into something more useful. Hopefully.",
    level: [],
    parent: null,
    milestones: {
      5: [
        eff.skillLevelBonus("dexterity", 1, 0),
        eff.skillLevelBonus("intelligence", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("crafting", 0.1),
        eff.skillLevelBonus("wit", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("dexterity", 0, 1.1),
        eff.skillLevelBonus("intelligence", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("crafting", 0.15),
        eff.skillLevelBonus("wit", 0, 1.1),
        eff.skillLevelBonus("dexterity", 0, 1.1),
      ],
      80: [
        eff.skillLevelBonus("dexterity", 0, 1.2),
        eff.skillLevelBonus("intelligence", 0, 1.15),
        eff.skillLevelBonus("wit", 0, 1.1),
        eff.skillXpMultiplier("crafting", 0.2),
      ],
    },
  },

  carpentry: {
    name: "Carpentry",
    description:
      "Cut wood into smaller pieces and somehow end up with furniture.",
    level: [],
    parent: "crafting",
    milestones: {
      5: [eff.skillLevelBonus("dexterity", 1, 0)],
      10: [
        eff.skillXpMultiplier("carpentry", 0.15),
        eff.skillLevelBonus("intelligence", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("dexterity", 0, 1.1),
        eff.grantSkillXp("woodcutting", 30),
      ],
      40: [
        eff.skillXpMultiplier("carpentry", 0.2),
        eff.skillLevelBonus("dexterity", 0, 1.1),
        eff.skillLevelBonus("intelligence", 0, 1.1),
      ],
      80: [
        eff.skillLevelBonus("dexterity", 0, 1.25),
        eff.skillLevelBonus("intelligence", 0, 1.15),
        eff.skillXpMultiplier("stoneworking", 0.1),
      ],
    },
  },

  stoneworking: {
    name: "Stoneworking",
    description: "Rock is stubborn. Be more stubborn.",
    level: [],
    parent: "crafting",
    milestones: {
      5: [eff.skillLevelBonus("strength", 1, 0)],
      10: [
        eff.skillXpMultiplier("stoneworking", 0.15),
        eff.skillLevelBonus("constitution", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.grantSkillXp("mining", 30),
      ],
      40: [
        eff.skillXpMultiplier("stoneworking", 0.2),
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.skillLevelBonus("dexterity", 1, 0),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.2),
        eff.skillLevelBonus("constitution", 0, 1.1),
        eff.skillLevelBonus("dexterity", 0, 1.1),
        eff.skillXpMultiplier("mining", 0.1),
      ],
    },
  },

  smithing: {
    name: "Smithing",
    description:
      "Turns out you're not actually meant to heat iron `red-hot`. Temper your expectations",
    level: [],
    parent: "crafting",
    milestones: {
      5: [
        eff.skillLevelBonus("strength", 1, 0),
        eff.skillLevelBonus("dexterity", 1, 0),
      ],
      10: [
        eff.skillXpMultiplier("smithing", 0.15),
        eff.skillLevelBonus("intelligence", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("strength", 0, 1.1),
        eff.skillLevelBonus("dexterity", 0, 1.1),
      ],
      40: [
        eff.skillXpMultiplier("smithing", 0.2),
        eff.skillLevelBonus("intelligence", 0, 1.1),
        eff.grantSkillXp("weapon_proficiency", 30),
      ],
      80: [
        eff.skillLevelBonus("strength", 0, 1.2),
        eff.skillLevelBonus("dexterity", 0, 1.2),
        eff.skillXpMultiplier("weapon_proficiency", 0.1),
        eff.skillXpMultiplier("mining", 0.1),
      ],
    },
  },

  cooking: {
    name: "Cooking",
    description:
      "Improve food through the careful application of heat. Usually.",
    level: [],
    parent: "crafting",
    milestones: {
      5: [eff.skillLevelBonus("wit", 1, 0)],
      10: [
        eff.skillXpMultiplier("cooking", 0.15),
        eff.skillLevelBonus("intelligence", 1, 0),
      ],
      20: [
        eff.skillLevelBonus("wit", 0, 1.1),
        eff.changeConditionStrength("hungry", -0.2),
      ],
      40: [
        eff.skillXpMultiplier("cooking", 0.2),
        eff.skillLevelBonus("intelligence", 0, 1.1),
        eff.changeConditionStrength("hungry", -0.3),
      ],
      80: [
        eff.skillLevelBonus("wit", 0, 1.2),
        eff.skillLevelBonus("intelligence", 0, 1.15),
        eff.changeConditionStrength("hungry", -0.4),
        eff.changeConditionStrength("poisoned", -0.2),
      ],
    },
  },
};
