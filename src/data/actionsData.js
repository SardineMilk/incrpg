import { eff, evt, fml, sel, target } from "../structures/structures.js";

const hit = (stat, amount, flags) =>
  eff.onTarget(target.random(target.enemies()), eff.changeValue(stat, amount), { isAttack: true, ...flags });

const foeAttack = (name, form, duration, damage, flags = {}) => ({
  name, duration,
  requirements: fml.active(form),
  result: [hit("health", -damage, { damageType: "physical", melee: true, ...flags })],
});


const PLAYER_ACTIONS = {
  walk: {
    name: "Walk",
    tags: ["traversal"],
    requirements: fml.any(sel.active(sel.tags("activities", "traversal"))),
    duration: 25,
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
    duration: 25,
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
    duration: 25,
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

  track_prey: {
    name: "Track Your Prey",
    requirements: fml.any(sel.active(sel.tags("activities", "tracking"))),
    duration: 10,
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.changeValue("stamina", -2),
        ],
      },
    ],
    result: [
      eff.gainXp("tracking", 14), eff.gainXp("observation", 4), eff.gainXp("sneaking", 6),
      eff.progress(sel.active(sel.tags("activities")), 1, "track")
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


  punch: {
    name: "Punch",
    // requirement: in combat
    requirements: fml.any(target.enemies()),
    duration: 10,
    result: [
      eff.onTarget(
        target.random(target.enemies()),
        eff.changeValue("health", -10),
        { isAttack: true, damageType: "physical" }
      )
    ]
  },



  possess: {
    name: "Possess",
    duration: 10,
    result: [
      eff.deactivate("plot_armor"),
      eff.changeUIActor(
        fml.randomActor()
      )
    ]
  },

};



const ENEMY_ACTIONS = {
  rat_bite:         foeAttack("Bite",  "feral_rat", 5,  6,  { damageType: "pierce" }),
  matriarch_gnaw:   foeAttack("Gnaw",  "matriarch", 8,  11, { damageType: "pierce" }),
  crab_pinch:       foeAttack("Pinch", "rock_crab", 12, 12, { damageType: "pierce" }),
  boar_gore:        foeAttack("Gore",  "wild_boar", 15, 22, { damageType: "slash" }),
};

export const ACTIONS = Object.assign({}, PLAYER_ACTIONS, ENEMY_ACTIONS);
