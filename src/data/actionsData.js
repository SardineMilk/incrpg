import { eff, evt, req, fml, sel } from "../structures/structures.js";


export const ACTIONS = {
  walk: {
    name: "Walk",
    tags: ["traversal"],
    duration: 100,
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainXp("constitution", 0.5),
          eff.gainXp("agility", 0.5),
          eff.gainXp("wit", 0.2),

          eff.changeValue("stamina", -1),
        ],
      },
    ],
    result: [
      eff.gainXp("walking", 20),
      eff.progress(sel.active(sel.tags("activity")), 1),
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
          eff.gainXp("constitution", 0.5),
          eff.gainXp("agility", 0.5),
          eff.gainXp("wit", 0.2),
          eff.gainXp("willpower", 0.2),

          eff.changeValue("stamina", -2),
        ],
      },
    ],
    result: [
      eff.gainXp("running", 20),
      eff.progress(sel.active(sel.tags("activity")), 2),
    ],
  },


  sprint: {
    name: "Sprint",
    tags: ["traversal"],
    duration: 20,
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainXp("constitution", 0.5),
          eff.gainXp("strength", 0.2),
          eff.gainXp("agility", 1),
          eff.gainXp("wit", 0.5),
          eff.gainXp("willpower", 0.5),

          eff.changeValue("stamina", -5),
          eff.changeValue("health", -2),
        ],
      },
    ],
    result: [
      eff.gainXp("running", 50),
      eff.progress(sel.active(sel.tags("activity")), 5),
    ],
  },

  sleep: {
    name: "Sleep",
    tags: ["rest"],
    duration: 100,
    passives: [eff.activate("asleep")],
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainXp("constitution", 0.5),
          eff.gainXp("willpower", 0.2),
        ],
      },
    ],
    result: [eff.gainXp("sleeping", 20)],
  },
  
  become_rat: {
    name: "Become Rat King",
    tags: ["transform"],
    duration: 10,
    result: [eff.activate("rat_king")]
  },


  test_exclusivity: {
    name: "Disable Action Exclusivity",
    duration: 10,
    result: [eff.deactivate("action_exclusivity"),]
  },

  detonate_nuke: {
    name: "Detonate Nuke (value loss recursion)",
    duration: 10,
    result: [eff.changeValue("test_value", -1),]
  },

  test_location: {
    name: "Change Location",
    duration: 10,
    result: [eff.activate("new_meldrum"),]
  },

  test_duration: {
    name: "Activate Test Condition",
    duration: 10,
    result: [eff.activate("test", 5),]
  },

  test_climbing: {
    name: "TEST - start climbing",
    duration: 10,
    result: [
      eff.activate("climb_northern_cliff"),
      eff.sendMessage("SYSTEM", "Started climbing"),
    ]
  },

  test_climb_up: {
    name: "TEST - climb up",
    duration: 10,
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainXp("climbing", 10),
          eff.changeValue("stamina", -2),
        ],
      },
    ],
    result: [
      eff.progress(sel.active(sel.tags("activities")), 10, "height"),
    ]
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
  falling_rocks:{
    name:"Avoid a scattered fall of small rocks",
    tags: ["earth"],
    duration: 20,
    check: {
      difficulty: 10,
      skills: {},
      success: [],
      failure: [],
    },
  },
  falling_boulder:{
    name:"Dodge a huge tumbling boulder",
    tags: ["earth"],
    duration: 20,
    check: {
      difficulty: 10,
      skills: {},
      success: [],
      failure: [],
    },
  },
};