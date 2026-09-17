import { eff, evt, fml, sel, target } from "../structures/structures.js";


export const ACTIONS = {
  walk: {
    name: "Walk",
    tags: ["traversal"],
    requirements: fml.any(sel.active(sel.tags("activities", "traversal"))),
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
    requirements: fml.any(sel.active(sel.tags("activities", "traversal"))),
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
    requirements: fml.any(sel.active(sel.tags("activities", "traversal"))),
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
    requirements: fml.any(sel.active(sel.tags("activities", "rest"))),
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
    requirements: fml.any(sel.active(sel.tags("activities", "vertical_traversal"))),
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
    requirements: fml.any(sel.active(sel.tags("activities", "vertical_traversal"))),
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
    requirements: fml.active("meldrum_library"),
    passives: [
      eff.uiClass("#game-screen", "weather-rain")
    ],
  },

  spawn_rat: {
    name: "TEST - Spawn Rat",
    requirements: fml.active("meldrum_library"),
    passives: [
      eff.spawn("rat", "evil")
    ],
  },

  become_rat: {
    name: "TEST - Become Rat",
    requirements: fml.active("meldrum_library"),
    duration: 10,
    result: [
      eff.changeUIActor(fml.actor("rat"))
    ]
  },

  become_player: {
    name: "TEST - Become Player",
    requirements: fml.active("meldrum_library"),
    duration: 10,
    result: [
      eff.changeUIActor(fml.actor("player"))
    ]
  },

  hit_rat: {
    name: "TEST - Hit Rat",
    requirements: fml.active("meldrum_library"),
    duration: 10,
    result: [
      eff.onTarget(
        target.random(target.enemies()),  // TODO - generalize attack target
        eff.changeValue("health", -25)
      )
    ]
  },

  // TODO - could this be automated? Would require proper macro code generation setup
  // Trivial Location Connections
  // To activate, they require the inital location and sometimes a prerequisite completion
  // Upon completion, they change location
  meldrum_to_forest: {
    name: "Enter the Forest",
    requirements: fml.active("new_meldrum"),
    duration: 10,
    result: [eff.activate("meldrum_forest")],
  },
  forest_to_meldrum: {
    name: "Return to the Village",
    requirements: fml.active("meldrum_forest"),
    duration: 10,
    result: [eff.activate("new_meldrum")],
  },

  forest_to_deep: {
    name: "Enter the Deep Forest",
    requirements: fml.active("meldrum_forest"),
    duration: 10,
    result: [eff.activate("meldrum_forest_deep")],
  },
  deep_to_forest: {
    name: "Return to the Forest Outskirts",
    requirements: fml.active("meldrum_forest_deep"),
    duration: 10,
    result: [eff.activate("meldrum_forest")],
  },

  beach_to_cave: {
    name: "Enter Sea Cave",
    requirements: fml.active("meldrum_beach"),
    duration: 10,
    result: [eff.activate("meldrum_sea_cave")],
  },
  cave_to_beach: {
    name: "Exit the Cave to the Beach",
    requirements: fml.active("meldrum_sea_cave"),
    duration: 10,
    result: [eff.activate("meldrum_beach")],
  },

  beach_to_pools: {
    name: "Stroll Along to the Tide Pools",
    requirements: fml.active("meldrum_beach"),
    duration: 10,
    result: [eff.activate("meldrum_tide_pools")],

  },
  pools_to_beach: {
    name: "Return to the Beach",
    requirements: fml.active("meldrum_tide_pools"),
    duration: 10,
    result: [eff.activate("meldrum_beach")],
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
