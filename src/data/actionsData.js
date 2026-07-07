import {eff, evt, req } from "../structures/structures.js";


export const ACTIONS = {
  walk: {
    name: "Walk",
    tags: ["traversal"],
    duration: 100,

    attributes: {
      strength: 0,
      constitution: 0.5,
      agility: 0.5,
      dexterity: 0.2,
      intelligence: 0,
      willpower: 0,
      wit: 0,
      perception: 0.2,
    },

    effects: [
      eff.changeValue("check_difficulty", -10),
    ],

    triggers: [
      {
        event: evt.tick(),
        effects: [eff.changeValue("stamina", -1)],
      },
    ],

    result: [
      eff.grantSkillXp("walking", 20),
      eff.activityProgress(1),
    ],
  },

  jog: {
    name: "Jog",
    tags: ["traversal"],
    duration: 50,

    attributes: {
      strength: 0,
      constitution: 0.5,
      agility: 0.5,
      dexterity: 0.2,
      intelligence: 0,
      willpower: 0.2,
      wit: 0,
      perception: 0.2,
    },

    triggers: [
      {
        event: evt.tick(),
        effects: [eff.changeValue("stamina", -2)],
      },
    ],

    result: [
      eff.grantSkillXp("running", 20),
      eff.activityProgress(2),
    ],
  },

  sprint: {
    name: "Sprint",
    tags: ["traversal"],
    duration: 20,

    attributes: {
      strength: 0.2,
      constitution: 0.5,
      agility: 1,
      dexterity: 0,
      intelligence: 0,
      willpower: 0.5,
      wit: 0,
      perception: 0,
    },

    effects: [
      eff.changeValue("check_difficulty", 10),
    ],


    triggers: [
      {
        event: evt.tick(),
        effects: [eff.changeValue("stamina", -5),eff.changeValue("health", -2)],
      },
    ],

    result: [
      eff.grantSkillXp("running", 50),
      eff.activityProgress(5),
    ],
  },

  sleep: {
    name: "Sleep",
    tags: ["rest"],
    duration: 100,

    attributes: {
      strength: 0,
      constitution: 0.5,
      agility: 0,
      dexterity: 0,
      intelligence: 0,
      willpower: 0.5,
      wit: 0,
      perception: 0,
    },

    skills: {
      sleeping: 1,
    },

    effects: [
      eff.applyConditionInfinite("sleeping"),
    ],


    result: [eff.grantSkillXp("sleeping", 20)],
  },
  
};


export const ADVERSARY_ACTIONS = {
  root_trip:{
    name:"Avoid tripping on a root",
    tags: ["ground", "nature"],
    duration: 20,
    check: {
      difficulty: 10,
      skills: {},
      success: [],
      failure: [],
    },
  }, 
  mud_puddle:{
    name:"Dodge a puddle of mud",
    tags: ["ground", "earth"],
    duration: 20,
    check: {
      difficulty: 10,
      skills: {},
      success: [],
      failure: [],
    },
  }, 
  thorn_bush:{
    name:"Fend off a thorny branch",
    tags: ["nature"],
    duration: 20,
    check: {
      difficulty: 10,
      skills: {},
      success: [],
      failure: [],
    },
  }, 
  wind_gust:{
    name:"Push through a sudden gust of wind",
    tags: ["weather"],
    duration: 20,
    check: {
      difficulty: 10,
      skills: {},
      success: [],
      failure: [],
    },
  },
  spot_trail:{
    name:"Find where the trail continues",
    tags: [],
    duration: 20,
    check: {
      difficulty: 10,
      skills: {},
      success: [],
      failure: [],
    },
  },
  ignore_wisps:{
    name:"Ignore the lure of Will-o'-the-wisps",
    tags: ["fae"],
    duration: 20,
    check: {
      difficulty: 10,
      skills: {},
      success: [],
      failure: [],
    },
  },
};