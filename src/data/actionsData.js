import { eff, evt, req, fml, sel } from "../structures/structures.js";


export const ACTIONS = {
  walk: {
    name: "Walk",
    tags: ["traversal"],
    requirements: [[req.active(sel.tags("activities", "traversal"))]],
    duration: 100,
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainXp("constitution", 5),
          eff.gainXp("agility", 0.5),
          eff.gainXp("wit", 0.2),

          eff.changeValue("stamina", -1),
        ],
      },
    ],
    result: [
      eff.gainXp("walking", 20),
      eff.progress(sel.active(sel.tags("activities")), 1, "distance"),
    ],
  },

  jog: {
    name: "Jog",
    tags: ["traversal"],
    requirements: [[req.active(sel.tags("activities", "traversal"))]],
    duration: 50,
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainXp("constitution", 0.5),
          eff.gainXp("agility", 0.5),
          eff.gainXp("wit", 0.2),
          eff.gainXp("willpower", 0.2),
          eff.gainXp("intelligence", 5),

          eff.changeValue("stamina", -2),
        ],
      },
    ],
    result: [
      eff.gainXp("running", 20),
      eff.progress(sel.active(sel.tags("activities")), 2, "distance"),
    ],
  },


  sprint: {
    name: "Sprint",
    tags: ["traversal"],
    requirements: [[req.active(sel.tags("activities", "traversal"))]],
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
      eff.progress(sel.active(sel.tags("activities")), 5, "distance"),
    ],
  },

  sleep: {
    name: "Sleep",
    tags: ["rest"],
    requirements: [[req.active(sel.tags("activities", "rest"))]],
    duration: 10,
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainXp("constitution", 0.5),
          eff.gainXp("willpower", 0.2),
        ],
      },
    ],
    result: [
      eff.gainXp("sleeping", 20),
      eff.progress(sel.active(sel.tags("activities")), 10, "relaxation")
    ],
  },

  climb_up: {
    name: "Climb Up",
    duration: 10,
    requirements: [[req.active(sel.tags("activities", "vertical_traversal"))]],
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainXp("climbing", 10),
          eff.changeValue("stamina", -2),
          eff.progress(sel.active(sel.tags("activities")), -3, "grip"),
        ],
      },
    ],
    result: [
      eff.progress(sel.active(sel.tags("activities")), 10, "height"),
    ]
  },

  climb_down: {
    name: "Climb Down",
    duration: 10,
    requirements: [[req.active(sel.tags("activities", "vertical_traversal"))]],
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.gainXp("climbing", 15),
          eff.changeValue("stamina", -3),
          eff.progress(sel.active(sel.tags("activities")), -3, "grip"),
        ],
      },
    ],
    result: [
      eff.progress(sel.active(sel.tags("activities")), -5, "height"),
    ]
  },

  activate_rain: {
    name: "TEST - Activate Rain",
    passives: [
      eff.uiClass("#game-screen", "weather-rain")
    ],
  },

  spawn_rat: {
    name: "TEST - Spawn Rat",
    passives: [
      eff.spawn("rat", "good")
    ],

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