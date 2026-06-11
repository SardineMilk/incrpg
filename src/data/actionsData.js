import { eff, req } from "./structure.js";

export const ACTIONS = {

  jogging: {
    name: "Jogging",
    duration: 20,
    requirements: [
      req.locationHasTag("outside"),
    ],

    attributes: {
      strength: 0.2,
      constitution: 0.5,
      agility: 1,
      dexterity: 0.2,
      intelligence: 0,
      willpower: 0.2,
      wit: 0,
      perception: 0.2,
    },

    skills: {
      running:1,
      exercise:0.5,
    },

    tick: [
      eff.changeResource("stamina", -2),
    ],

    result: [
      //eff.sendMessage("Result", "You went for a short run"),
      eff.changeResource("health", -1),
      eff.grantSkillXp("running", 20),
      eff.grantSkillXp("exercise", 10),
    ]
  },

  calisthenics: {
    name: "Calisthenics",
    duration: 20,
    requirements: [
      req.locationHasTag("outside"),
    ],

    attributes: {
      strength: 1,
      constitution: 0.5,
      agility: 0.2,
      dexterity: 0.5,
      intelligence: 0,
      willpower: 0.2,
      wit: 0,
      perception: 0,
    },

    skills: {
      exercise:1,
    },

    tick: [
      eff.changeResource("stamina", -2),
    ],

    result: [
      //eff.sendMessage("Result", "You went for a short run"),
      eff.changeResource("health", -1),
      eff.grantSkillXp("exercise", 10),
    ]
  },

  trainSword: {
    name: "Train Sword",
    duration: 30,
    requirements: [
      req.item("sword"),
      req.locationHasTag("outside"),
    ],

    attributes: {
      strength: 0.7,
      constitution: 0.5,
      agility: 0.7,
      dexterity: 0.5,
      intelligence: 0.2,
      willpower: 0.2,
      wit: 0.2,
      perception: 0.2,
    },

    skills: {
      sword: 1,
      training: 0.5,
    },

    result: [
      eff.changeResource("stamina", -5),
      eff.grantSkillXp("sword", 25),
    ],
  },

  meditate: {
    name: "Meditate",

    duration: 50,

    attributes: {
      strength: 0,
      constitution: 0.2,
      agility: 0,
      dexterity: 0,
      intelligence: 0.5,
      willpower: 1,
      wit: 0.5,
      perception: 0.2,
    },


    skills: {
      meditation: 1,
      breathing: 0.5,
    },

    tick: [
      eff.changeResource("mental", -2),
    ],

    result: [
      eff.grantSkillXp("meditation", 20),
    ],
  },

  sleeping: {
    name: "Sleeping",

    duration: 100,

    attributes: {
      strength: 0,
      constitution: 0.2,
      agility: 0,
      dexterity: 0,
      intelligence: 0,
      willpower: 0.2,
      wit: 0,
      perception: 0,
    },


    skills: {
      sleeping: 1,
    },


    tick: [
      eff.applyCondition("sleeping", 1),
    ],

    result: [
      eff.grantSkillXp("sleeping", 20),
    ],
  },
};