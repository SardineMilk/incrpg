import {eff, req, evt, sel, fml } from "../structures/structures.js";

/*
* Worldbuilding
*
Consider the system conditions, and their integration with the hardcoded engine functionality
Consider how the player interacts with them
The system is imposed upon the world, not a foundational part of it
This means sufficiently advanced magic can interact with it, or disable it entirely
The game should still technically function without the system
However, the system exists for a reason
Things can and will break horribly without extreme preparation
- the tools provided to the player should allow some form of interation with the system
- it doesn't have to be clean or exact, but something somewhere should give the player a chance 
- no special-cased safeties or clean "remove this specific limitation on your character"
- if you're messing with the system, you need a very smart plan
- emergent complexity is key for this part of the game                                 
- example of what a proccess might look like
  - seclude self in an empty location, with as few external effects as possible
  - cast huge combination of temporary debuff/suppression spells on self               
  - this disables every permanent effect (e.g. regen), with a few exceptions (e.g. mortality)                                                                                                                                                                                                
  - cast system-affecting spell:
     - alter the system timer entropy to also affect permanent conditions for a tick
  - suppression wears off, reactivating most permanent effects
  - congratulations, you have become immortal
This is just an example of what type of thing should be possible
Think noita-style exploits, 
Use the tools given inside the box to break out of it rather than circumventing the rules entirely
Take a zoomed-out look at the engine structure, and how the conditions system interacts with it
Design the structure to allow this type of sandbox exploration, with combinations the designers never considered
This is how we make interacting with the game feel like real magic
*/

export const INHERENT_EFFECTS = {
  system_awakened: {
    tags: ["developer"],
    name: "System Awakened",
    description: "Lorem Ipsum",
    effects: [
      eff.xpMultiplier(sel.tags("skill"), { multiplier: 10 }),
    ],
  },

  startup: {
    effects: [
      eff.activate(sel.tags("system", "conditions")),
      eff.activate(sel.tags("mortal", "conditions")),
      eff.activate("human"),
      eff.activate("starter_hut"),
      eff.activate("sleep"),
    ]
  },

  health_regen: {
    tags: ["passive_regen", "mortal"],
    triggers: [
      {
        event: evt.tick(),
        requirements: [req.lessThan(fml.value("health"), fml.value("healthMax"))],
        effects: [
          eff.changeValue("health", 1),
          eff.gainXp("regeneration", 0.5),
        ]
      },
    ],
  },
  stamina_regen: {
    tags: ["passive_regen", "mortal"],
    triggers: [
      {
        event: evt.tick(),
        requirements: [req.lessThan(fml.value("stamina"), fml.value("staminaMax"))],
        effects: [
          eff.changeValue("stamina", 1),
          eff.gainXp("breathing", 0.5),
        ]
      },
    ],
  },
  mental_regen: {
    tags: ["passive_regen", "mortal"],
    triggers: [
      {
        event: evt.tick(),
        requirements: [req.lessThan(fml.value("mental"), fml.value("mentalMax"))],
        effects: [
          eff.changeValue("mental", 1),
          eff.gainXp("mindfulness", 0.5),
        ]
      },
    ],
  },

  /* Slowly drain resources over max, exponentially scaling with amount over
  *
  * This could be interacted with later?
  * Deal more damage depending on amount over
  * Lower amount drained per tick with skill
  * Temp disable drain with a spell
  * Enemy deals more damage based on amount drained
  * Enemy overhealer, turning you into a tumurous mass
  */
  overHealth: {
    tags: ["mortal"],
    triggers: [
      {
        event: evt.tick(),
        requirements: [req.moreThan(fml.value("health"), fml.value("healthMax"))],
        effects: [
          eff.changeValue(
            "health", 
            fml.div(fml.sub(fml.value("healthMax"), fml.value("health")), 10)
          ),
        ]
      },
    ]
  },
  overStamina: {
    tags: ["mortal"],
    triggers: [
      {
        event: evt.tick(),
        requirements: [req.moreThan(fml.value("stamina"), fml.value("staminaMax"))],
        effects: [
          eff.changeValue(
            "stamina", 
            fml.div(fml.sub(fml.value("staminaMax"), fml.value("stamina")), 10)
          ),
        ]
      },
    ]
  },
  overMental: {
    tags: ["mortal"],
    triggers: [
      {
        event: evt.tick(),
        requirements: [req.moreThan(fml.value("mental"), fml.value("mentalMax"))],
        effects: [
          eff.changeValue(
            "mental", 
            fml.div(fml.sub(fml.value("mentalMax"), fml.value("mental")), 10)
          ),
        ]
      },
    ]
  },


  health_death: {
    tags: ["mortal"],
    triggers: [
      {
        event: evt.valueLoss("health"),
        requirements: [req.valueLessThan("health", 0)],
        effects: [
          eff.sendMessage("SYSTEM", "You pass out from your injuries"),
          eff.activate("sleep"),
        ],
      }
    ],
  },
  stamina_death: {
    tags: ["mortal"],
    triggers: [
      {
        event: evt.valueLoss("stamina"),
        requirements: [req.valueLessThan("stamina", 0)],
        effects: [
          eff.sendMessage("SYSTEM", "You pass out"),
          eff.activate("sleep"),
        ],
      }
    ],
  },
  mental_death: {
    tags: ["mortal"],
    triggers: [
      {
        event: evt.valueLoss("mental"),
        requirements: [req.valueLessThan("mental", 0)],
        effects: [
          eff.sendMessage("SYSTEM", "You pass out from stress"),
          eff.activate("sleep"),
        ],
      }
    ],
  },


  parent_xp: {
    tags: ["system", "causality"],
    triggers: [
      {
        event: evt.gainXp(),
        effects: [
          eff.gainXp(
            fml.skillParent(fml.context("id")),
            fml.context("amount"),
           ),
        ]
      }
    ],
  },

  // Utterly idiotic way to do this
  // Condition passive effects can contain formulas, 
  // which need reapplied whenever the formula resolved value changes
  // Solution - manually tag them with "dynamic", then reapply every tick
  // Simple!
  // lmfao.
  condition_update: {
    tags: ["system", "causality"],
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.reapplyCondition(sel.tags("conditions", "dynamic"))
        ]
      }
    ]
  },

  action_progress: {
    tags: ["system", "entropy"],
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.progress(sel.active(sel.tags("actions")), 1),
        ]
      }
    ]
  },

  condition_decay: {
    tags: ["system", "entropy"],
    triggers: [
      {
        event: evt.tick(),
        effects: [eff.changeDuration(sel.active(sel.tags("conditions")), -1)],
      },
    ],
  },
  duration_expiry: {
    tags: ["system", "entropy"],
    triggers: [{
      event: evt.durationExpired(),
      effects: [eff.deactivate(fml.context("id")),eff.sendMessage("SYSTEM", "Duration expired")],
    }],
  },
  
  action_exclusivity: {
    tags: ["system", "singularity"],
    modifiers: [
      {
        event: evt.activate(),
        requirements: [req.hasTag(fml.id(), "actions")],
        effects: [
          eff.deactivate(sel.active(sel.tags("actions"))),
          eff.sendMessage("SYSTEM", fml.add("Action: ", fml.id()))
        ],
      }
    ]
  },
  form_exclusivity: {
    tags: ["system", "singularity"],
    modifiers: [
      {
        event: evt.activate(),
        requirements: [req.hasTag(fml.id(), "form")],
        effects: [eff.deactivate(sel.active(sel.tags("form")))],
      },
    ],
  },
  location_exclusivity: {
    tags: ["system", "singularity"],
    modifiers: [
      {
        event: evt.activate(),
        requirements: [req.hasTag(fml.id(), "locations")],
        effects: [eff.deactivate(sel.active(sel.tags("locations")))],
      },
    ],
  },
  activity_exclusivity: {
    tags: ["system", "singularity"],
    modifiers: [
      {
        event: evt.activate(),
        requirements: [req.hasTag(fml.id(), "activities")],
        effects: [eff.deactivate(sel.active(sel.tags("activities")))],
      },
    ],
  },


  tick_counter: {
    tags: ["system"],
    modifiers: [
      {
        event: evt.tick(),
        effects: [eff.changeValue("current_tick", 1)]
      }
    ]
  },
  
  // onko342 easter egg, put this somewhere funny
  memory_leek: {
    tags: ["item", "eldritch"],
    name: "Memory Leek",
    description: "Exposure to this eldritch accessory rapidly fills aspects of the user's reality with Leeks. Thought to have been wielded by the legendary Kitsune bard, Haku.",
    triggers: [
      {
        event: evt.tick(),
        effects: [eff.setValue(fml.value("current_tick"), "leek")]
      }
    ]
  },

  test: {
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.sendMessage("system", fml.add("test condition: ", fml.duration("test")))
        ]
      },
    ]
  },

  /*
  TEST_formula_resolution_in_selector_candidate_context: {
    tags: ["system"],

    effects: [
      eff.gainXp(sel.tags("skills"), fml.add(0, fml.level(fml.candidate("id")))),
    ],
  },
  */

  nuke: {
    tags: ["system", "game_breaking"],
    triggers: [
      {
        event: evt.valueLoss("test_value"),
        effects: [eff.changeValue("test_value", -1)],
      }
    ]
  },

};


const TRAITS = {
  human: {
    tags: ["form"],
    effects: [
      eff.changeValue("healthMax",  100),
      eff.changeValue("staminaMax", 100),
      eff.changeValue("mentalMax",  100),
    ],
  },

  rat_king: {
    tags: ["form", "beast", "rat"],
    effects: [
      eff.changeValue("healthMax",  80),
      eff.changeValue("staminaMax", 150),
      eff.changeValue("mentalMax",  70),

      eff.deactivate("stamina_death"),
    ],
  },

  /* Elf 
  * All equipment must be natural
  */


  /* Dwarf
  * Is an insect (COE5)
  * Armour penetration?
  * - affinity with stone/metal, therefore can break it easier
  * - naturally better at mining, since rocks have high armour
  * - might not lead to thematic builds
  * Poison resistance
  */

  /* Automaton
  * Replace stamina/mental with shared resource
  * - heat or fuel?
  * Immune to mental conditions
  */

  /* Parasite Elemental
  * Very low stats/resources
  * Wear the form of last defeated enemy
  * Taking damage reduces form integrity, lowering bonuses
  */

  /* Arachne Brood
  * Less health
  * Crits inflict paralysing venom
  * Damage bonus against restrained targets
  */


  // This requires:
  // modifiers to be able to hook formula resolution events
  // formulas to be modifiable
  loaded_die: {
    modifiers: [
      {
        event: null,  // on fml.roll()
        effects: null // increase roll.min by 1
      },
    ]
  },

  // 0.5x health regen normally
  // 1.5x health regen for 10 ticks after taking damage
  trollish_regeneration: {
    effects: [eff.changeStrength("health_regen", {multiplier: 0.5})],
    triggers: [
      {
        event: evt.valueLoss("health"),
        effects: [eff.activate("impaired_trollish_regeneration", 10)],
      }
    ]
  },
  impaired_trollish_regeneration: {
    effects: [eff.changeStrength("health_regen", {multiplier: 3})],
  }

}


const TEMP_CONDITIONS = {
  asleep: {
    name: "Asleep",
    description: "You are asleep, greatly boosting your natural recovery",
    effects: [
      eff.changeStrength(sel.tags("conditions", "passive_regen"), {flat: 10}),
    ],
  },

  combat_fatigue: {
    name: "Combat Fatigue",
    description:
      "The chaos of battle is getting to you. You're getting stressed and fatigued",
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.changeValue("stamina", -1),
          eff.changeValue("mental", -1),
        ],
      },
    ],
  },

  wet: {
    name: "Wet",
    description:
      "You're soaked. Lowers cold resistance, increases fire resistance",
    effects: [

    ],
  },

  chilly: {
    name: "Chilly",
    description:
      "You feel chilly. You move and regenerate stamina slightly slower",
    effects: [
      eff.levelBonus("agility", {multiplier: 0.9}),
      eff.changeStrength("stamina_regen", {multiplier: 0.7}),
    ],
  },
  
  cold: {
    name: "Cold",
    description:
      "You feel cold. You move and regenerate stamina slower. You have a slight mental drain.",
    effects: [eff.levelBonus("agility", {multiplier: 0.7})]
  },

  injury: {
    name: "Injury",
    description: "Lorem ipsum dolor sit amet.",
    effects: [
 
    ],
  },

};





const IMBALANCES = {
  /* Attribute Imbalance - apply effects if attribute x is more than attribute y, named as x_y
  * Should have a large effect on gameplay, and be thematic
  * Generally negative but with benefits to niche playstyles
  * Example effects (not final): 
  * Wit > Int makes powerful magic much less effective, but weaker magic gets a chance to cast twice
  * Agi > Con increases speed, but you take damage when moving fast
  * Con > Wil makes you take ~10% less damage, but when you lose health lose mental ~20% of the amount 
  */ 
  imbalance_con_str: {
    requirements: [req.skillsImbalanced("constitution", "strength")],
    effects: [

    ],
  },
  imbalance_con_agi: {
    requirements: [req.skillsImbalanced("constitution", "agility")],
    effects: [

    ],
  },
  imbalance_con_wit: {
    requirements: [req.skillsImbalanced("constitution", "wit")],
    effects: [

    ],
  },
  imbalance_con_int: {
    requirements: [req.skillsImbalanced("constitution", "intelligence")],
    effects: [

    ],
  },
  imbalance_con_wil: {
    requirements: [req.skillsImbalanced("constitution", "willpower")],
    effects: [

    ],
  },

  imbalance_str_con: {
    requirements: [req.skillsImbalanced("strength", "constitution")],
    effects: [

    ],
  },
  imbalance_str_agi: {
    requirements: [req.skillsImbalanced("strength", "agility")],
    effects: [

    ],
  },
  imbalance_str_wit: {
    requirements: [req.skillsImbalanced("strength", "wit")],
    effects: [

    ],
  }, 
  imbalance_str_int: {
    requirements: [req.skillsImbalanced("strength", "intelligence")],
    effects: [

    ],
  },
  imbalance_str_wil: {
    requirements: [req.skillsImbalanced("strength", "willpower")],
    effects: [

    ],
  }, 


  imbalance_agi_str: {
    requirements: [req.skillsImbalanced("agility", "strength")],
    effects: [

    ],
  },
  imbalance_agi_con: {
    requirements: [req.skillsImbalanced("agility", "constitution")],
    effects: [

    ],
  },
  imbalance_agi_wit: {
    requirements: [req.skillsImbalanced("agility", "wit")],
    effects: [

    ],
  },
  imbalance_agi_int: {
    requirements: [req.skillsImbalanced("agility", "intelligence")],
    effects: [

    ],
  },
  imbalance_agi_wil: {
    requirements: [req.skillsImbalanced("agility", "willpower")],
    effects: [

    ],
  },

  imbalance_wit_str: { 
    requirements: [req.skillsImbalanced("wit", "strength")],
    effects: [

    ], 
  },
  imbalance_wit_con: { 
    requirements: [req.skillsImbalanced("wit", "constitution")],
    effects: [

    ], 
  },
  imbalance_wit_agi: { 
    requirements: [req.skillsImbalanced("wit", "agility")],
    effects: [

    ], 
  },
  imbalance_wit_dex: { 
    requirements: [req.skillsImbalanced("wit", "dexterity")],
    effects: [

    ], 
  },
  imbalance_wit_int: { 
    requirements: [req.skillsImbalanced("wit", "intelligence")],
    effects: [

    ], 
  },
  imbalance_wit_wil: { 
    requirements: [req.skillsImbalanced("wit", "willpower")],
    effects: [

    ], 
  },


  imbalance_int_str: {
    requirements: [req.skillsImbalanced("intelligence", "strength")],
    effects: [

    ],
  },
  imbalance_int_con: {
    requirements: [req.skillsImbalanced("intelligence", "constitution")],
    effects: [

    ],
  },
  imbalance_int_agi: {
    requirements: [req.skillsImbalanced("intelligence", "agility")],
    effects: [

    ],
  },
  imbalance_int_wit: {
    requirements: [req.skillsImbalanced("intelligence", "wit")],
    effects: [

    ],
  },
  imbalance_int_wil: {
    requirements: [req.skillsImbalanced("intelligence", "willpower")],
    effects: [

    ],
  },

  imbalance_wil_str: { 
    requirements: [req.skillsImbalanced("willpower", "strength")], 
    effects: [

    ], 
  },
  imbalance_wil_con: { 
    requirements: [req.skillsImbalanced("willpower", "constitution")], 
    effects: [

    ], 
  },
  imbalance_wil_agi: { 
    requirements: [req.skillsImbalanced("willpower", "agility")], 
    effects: [

    ], 
  },
  imbalance_wil_wit: { 
    requirements: [req.skillsImbalanced("willpower", "wit")], 
    effects: [

    ], 
  },
  imbalance_wil_int: { 
    requirements: [req.skillsImbalanced("willpower", "intelligence")], 
    effects: [

    ], 
  },


}


export const CONDITIONS = Object.assign({}, TEMP_CONDITIONS, TRAITS, INHERENT_EFFECTS, IMBALANCES);
