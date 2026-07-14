import {eff, evt, req } from "../structures/structures.js";


export const ACTIONS = {
  walk: {
    name: "Walk",
    tags: ["traversal"],
    duration: 100,

    effects: [
      eff.changeValue("check_difficulty", -10),
    ],

    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainSkillXp("constitution", 0.5),
          eff.gainSkillXp("agility", 0.5),
          eff.gainSkillXp("dexterity", 0.2),
          eff.gainSkillXp("perception", 0.2),

          eff.changeValue("stamina", -1),
        ],
      },
    ],

    result: [
      eff.gainSkillXp("walking", 20),
      eff.activityProgress(1),
    ],
  },

  jog: {
    name: "Jog",
    tags: ["traversal"],
    duration: 50,

    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainSkillXp("constitution", 0.5),
          eff.gainSkillXp("agility", 0.5),
          eff.gainSkillXp("dexterity", 0.2),
          eff.gainSkillXp("willpower", 0.2),
          eff.gainSkillXp("perception", 0.5),

          eff.changeValue("stamina", -2),
        ],
      },
    ],

    result: [
      eff.gainSkillXp("running", 20),
      eff.activityProgress(2),
    ],
  },

  sprint: {
    name: "Sprint",
    tags: ["traversal"],
    duration: 20,

    effects: [
      eff.changeValue("check_difficulty", 10),
    ],

    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainSkillXp("strength", 0.2),
          eff.gainSkillXp("constitution", 0.5),
          eff.gainSkillXp("agility", 1),
          eff.gainSkillXp("willpower", 0.5),
          eff.gainSkillXp("perception", 1),

          eff.changeValue("stamina", -5),
          eff.changeValue("health", -2),
        ],
      },
    ],

    result: [
      eff.gainSkillXp("running", 50),
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

    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainSkillXp("constitution", 0.5),
          eff.gainSkillXp("willpower", 0.2),
        ],
      },
    ],

    effects: [
      eff.activateCondition("asleep"),
    ],


    result: [eff.gainSkillXp("sleeping", 20)],
  },
  
  become_rat: {
    name: "Become Rat King",
    tags: ["transform"],
    duration: 100,

    result: [
      eff.activateCondition("rat_king"),
    ]
  }

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