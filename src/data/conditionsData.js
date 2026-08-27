import {eff, req, evt, sel, fml, mod } from "../structures/structures.js";

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
    passives: [
      eff.xpMultiplier(sel.tags("skills"), { multiplier: 10 }),
    ],
  },

  startup: {
    passives: [
      eff.activate(sel.tags("system", "conditions")),
      eff.activate(sel.tags("mortal", "conditions")),
      eff.activate("human"),
      eff.activate("new_meldrum"),
    ]
  },

  health_regen: {
    tags: ["passive_regen", "mortal"],
    triggers: [
      {
        event: evt.tick(),
        requirements: [req.lt(fml.value("health"), fml.value("healthMax"))],
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
        requirements: [req.lt(fml.value("stamina"), fml.value("staminaMax"))],
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
        requirements: [req.lt(fml.value("mental"), fml.value("mentalMax"))],
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
        requirements: [req.gt(fml.value("health"), fml.value("healthMax"))],
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
        requirements: [req.gt(fml.value("stamina"), fml.value("staminaMax"))],
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
        requirements: [req.gt(fml.value("mental"), fml.value("mentalMax"))],
        effects: [
          eff.changeValue(
            "mental", 
            fml.div(fml.sub(fml.value("mentalMax"), fml.value("mental")), 10)
          ),
        ]
      },
    ]
  },

  // TODO - some actually interesting death penalty
  // Losing all health/stamina/mental makes you vulnerable, not dead
  // Health - death
  // Stamina - cannot perform actions or dodge
  // Mental - cannot resist debuffs
  // At beginning, you have a buff with pre trigger on death that teleports you to bed

  health_death: {
    tags: ["mortal"],
    triggers: [
      {
        event: evt.valueLoss("health"),
        requirements: [req.valueLessThan("health", 0)],
        effects: [
          eff.sendMessage("SYSTEM", "You pass out from your injuries"),
          eff.deactivate(sel.active(sel.tags("actions"))),
          eff.deactivate(sel.active(sel.tags("activities")))
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
          eff.deactivate(sel.active(sel.tags("actions"))),
          eff.deactivate(sel.active(sel.tags("activities")))
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
          eff.deactivate(sel.active(sel.tags("actions"))),
          eff.deactivate(sel.active(sel.tags("activities")))
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
            fml.parent(fml.id()),
            fml.amount(),
           ),
        ]
      }
    ],
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
    tags: ["system", "causality"],
    triggers: [{
      event: evt.durationExpired(),
      effects: [eff.deactivate(fml.id()),eff.sendMessage("SYSTEM", "Duration expired")],
    }],
  },
  
  action_exclusivity: {
    tags: ["system", "singularity"],
    triggers: [
      {
        event: evt.activate(),
        phase: "pre",
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
    triggers: [
      {
        event: evt.activate(),
        phase: "pre",
        requirements: [req.hasTag(fml.id(), "form")],
        effects: [eff.deactivate(sel.active(sel.tags("form")))],
      },
    ],
  },
  location_exclusivity: {
    tags: ["system", "singularity"],
    triggers: [
      {
        event: evt.activate(),
        phase: "pre",
        requirements: [req.hasTag(fml.id(), "locations")],
        effects: [eff.deactivate(sel.active(sel.tags("locations")))],
      },
    ],
  },
  activity_exclusivity: {
    tags: ["system", "singularity"],
    triggers: [
      {
        event: evt.activate(),
        phase: "pre",
        requirements: [req.hasTag(fml.id(), "activities")],
        effects: [eff.deactivate(sel.active(sel.tags("activities")))],
      },
    ],
  },

  force_notify_per_tick: {
    tags: ["system"],
    triggers: [
      {
        event: evt.tick(),
        effects: [eff.forceNotifyAll()]
      }
    ],
  },

  tick_counter: {
    tags: ["system"],
    triggers: [
      {
        event: evt.tick(),
        phase: "pre",
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

  // This is used by climbing skill
  // Skill increases strength of this per level
  // This will be a common pattern, and it's quite clunky
  climbing_height_gain: {
    tags: ["system"],
    modifiers: [
      {
        event: evt.progress("height"),
        modify: [
          mod.amountMult(1),
        ]
      }
    ]
  },

  grip_restore: {
    tags: ["system"],
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.progress(sel.active(sel.tags("activities")), 1, "grip")
        ]
      }
    ]
  },


  level_up_message: {
    tags: ["system"],
    triggers: [
      {
        event: evt.levelUp(),
        effects: [eff.sendMessage("SYSTEM", fml.add("Level Up: ",fml.name(fml.id())," ",fml.ctx("level")))]
      }
    ]
  },


};


const TRAITS = {
  human: {
    tags: ["form"],
    passives: [
      eff.changeValue("healthMax",  100),
      eff.changeValue("staminaMax", 150),
      eff.changeValue("mentalMax",  100),
    ],
  },

  ratkin: {
    tags: ["form", "beast", "rat"],
    passives: [
      eff.changeValue("healthMax",  80),
      eff.changeValue("staminaMax", 100),
      eff.changeValue("mentalMax",  90),

      // some rat-themed perk. maybe disable food poisoning?
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

  /* Shroomkin
  * Mushroom
  * Eating too many strong mushrooms turns you into one
  * 
  */

  // This requires:
  // modifiers to be able to hook formula resolution events
  // formulas to be modifiable
  // pre-triggers too preferably
  loaded_die: {
    modifiers: [
      {
        event: null,  // on fml.roll()
        modify: null // increase roll.min by 1
      },
    ]
  },

  // 0.5x health regen normally
  // 1.5x health regen for 10 ticks after taking damage
  trollish_regeneration: {
    passives: [eff.changeStrength("health_regen", {multiplier: 0.5})],
    triggers: [
      {
        event: evt.valueLoss("health"),
        effects: [eff.activate("activated_trollish_regeneration", 10)],
      }
    ]
  },
  activated_trollish_regeneration: {
    passives: [eff.changeStrength("health_regen", {multiplier: 3})],
  }

}


const TEMP_CONDITIONS = {
  asleep: {
    name: "Asleep",
    description: "You are asleep, greatly boosting your natural recovery",
    passives: [
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
    description: "You're soaked to the bone",
    passives: [

    ],
  },

  chilly: {
    name: "Chilly",
    description: "You feel chilly. You move and regenerate stamina slightly slower",
    passives: [
      eff.levelBonus("agility", {multiplier: 0.9}),
      eff.changeStrength("stamina_regen", {multiplier: 0.7}),
    ],
  },
  
  cold: {
    name: "Cold",
    description: "You feel very cold",
    passives: [
      eff.levelBonus("agility", {multiplier: 0.7}),
      eff.changeStrength("stamina_regen", {multiplier: 0.4}),
    ]
  },

  injury: {
    name: "Injury",
    description: "Lorem ipsum dolor sit amet.",
    passives: [
 
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
    passives: [

    ],
  },
  imbalance_con_agi: {
    requirements: [req.skillsImbalanced("constitution", "agility")],
    passives: [

    ],
  },
  imbalance_con_wit: {
    requirements: [req.skillsImbalanced("constitution", "wit")],
    passives: [

    ],
  },
  imbalance_con_int: {
    requirements: [req.skillsImbalanced("constitution", "intelligence")],
    passives: [

    ],
  },
  imbalance_con_wil: {
    requirements: [req.skillsImbalanced("constitution", "willpower")],
    passives: [

    ],
  },

  imbalance_str_con: {
    requirements: [req.skillsImbalanced("strength", "constitution")],
    passives: [

    ],
  },
  imbalance_str_agi: {
    requirements: [req.skillsImbalanced("strength", "agility")],
    passives: [

    ],
  },
  imbalance_str_wit: {
    requirements: [req.skillsImbalanced("strength", "wit")],
    passives: [

    ],
  }, 
  imbalance_str_int: {
    requirements: [req.skillsImbalanced("strength", "intelligence")],
    passives: [

    ],
  },
  imbalance_str_wil: {
    requirements: [req.skillsImbalanced("strength", "willpower")],
    passives: [

    ],
  }, 


  imbalance_agi_str: {
    requirements: [req.skillsImbalanced("agility", "strength")],
    passives: [

    ],
  },
  imbalance_agi_con: {
    requirements: [req.skillsImbalanced("agility", "constitution")],
    passives: [

    ],
  },
  imbalance_agi_wit: {
    requirements: [req.skillsImbalanced("agility", "wit")],
    passives: [

    ],
  },
  imbalance_agi_int: {
    requirements: [req.skillsImbalanced("agility", "intelligence")],
    passives: [

    ],
  },
  imbalance_agi_wil: {
    requirements: [req.skillsImbalanced("agility", "willpower")],
    passives: [

    ],
  },

  imbalance_wit_str: { 
    requirements: [req.skillsImbalanced("wit", "strength")],
    passives: [

    ], 
  },
  imbalance_wit_con: { 
    requirements: [req.skillsImbalanced("wit", "constitution")],
    passives: [

    ], 
  },
  imbalance_wit_agi: { 
    requirements: [req.skillsImbalanced("wit", "agility")],
    passives: [

    ], 
  },
  imbalance_wit_dex: { 
    requirements: [req.skillsImbalanced("wit", "dexterity")],
    passives: [

    ], 
  },
  imbalance_wit_int: { 
    requirements: [req.skillsImbalanced("wit", "intelligence")],
    passives: [

    ], 
  },
  imbalance_wit_wil: { 
    requirements: [req.skillsImbalanced("wit", "willpower")],
    passives: [

    ], 
  },


  imbalance_int_str: {
    requirements: [req.skillsImbalanced("intelligence", "strength")],
    passives: [

    ],
  },
  imbalance_int_con: {
    requirements: [req.skillsImbalanced("intelligence", "constitution")],
    passives: [

    ],
  },
  imbalance_int_agi: {
    requirements: [req.skillsImbalanced("intelligence", "agility")],
    passives: [

    ],
  },
  imbalance_int_wit: {
    requirements: [req.skillsImbalanced("intelligence", "wit")],
    passives: [

    ],
  },
  imbalance_int_wil: {
    requirements: [req.skillsImbalanced("intelligence", "willpower")],
    passives: [

    ],
  },

  imbalance_wil_str: { 
    requirements: [req.skillsImbalanced("willpower", "strength")], 
    passives: [

    ], 
  },
  imbalance_wil_con: { 
    requirements: [req.skillsImbalanced("willpower", "constitution")], 
    passives: [

    ], 
  },
  imbalance_wil_agi: { 
    requirements: [req.skillsImbalanced("willpower", "agility")], 
    passives: [

    ], 
  },
  imbalance_wil_wit: { 
    requirements: [req.skillsImbalanced("willpower", "wit")], 
    passives: [

    ], 
  },
  imbalance_wil_int: { 
    requirements: [req.skillsImbalanced("willpower", "intelligence")], 
    passives: [

    ], 
  },


}


export const CONDITIONS = Object.assign({}, TEMP_CONDITIONS, TRAITS, INHERENT_EFFECTS, IMBALANCES);
