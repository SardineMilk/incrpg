import {eff, req, evt, sel, fml } from "../structures/structures.js";


// Need to special-case these. Apply all at start of game
// Inherent Effects are always active, and may have strict requirements or triggers
export const INHERENT_EFFECTS = {

  health_regen: {
    tags: ["passive_regen"],
    triggers: [
      {
        event: evt.tick(),
        requirements: [req.lessThan(fml.value("health"), fml.value("healthMax"))],
        effects: [
          eff.changeValue("health", 1),
          eff.gainSkillXp("regeneration", 0.5),
        ]
      },
    ],
  },
  stamina_regen: {
    tags: ["passive_regen"],
    triggers: [
      {
        event: evt.tick(),
        requirements: [req.lessThan(fml.value("stamina"), fml.value("staminaMax"))],
        effects: [
          eff.changeValue("stamina", 1),
          eff.gainSkillXp("breathing", 0.5),
        ]
      },
    ],
  },
  mental_regen: {
    tags: ["passive_regen"],
    triggers: [
      {
        event: evt.tick(),
        requirements: [req.lessThan(fml.value("mental"), fml.value("mentalMax"))],
        effects: [
          eff.changeValue("mental", 1),
          eff.gainSkillXp("mindfulness", 0.5),
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

  /*
  death: {
    triggers: [
      {
        event: evt.valueLoss(sel.ids(["health", "stamina", "mental"])),
        requirements: [[req.valueLessThan(sel.ids(["health", "stamina", "mental"]), 0)]],
        effects: [
          eff.activateAction("sleep"),
          eff.sendMessage("SYSTEM", "You pass out"),
        ],
      }
    ],
  },
  */
  health_death: {
    triggers: [
      {
        event: evt.valueLoss("health"),
        requirements: [req.valueLessThan("health", 0)],
        effects: [
          eff.activateAction("sleep"),
          eff.sendMessage("SYSTEM", "You pass out from your injuries"),
        ],
      }
    ],
  },
  stamina_death: {
    triggers: [
      {
        event: evt.valueLoss("stamina"),
        requirements: [req.valueLessThan("stamina", 0)],
        effects: [
          eff.activateAction("sleep"),
          eff.sendMessage("SYSTEM", "You pass out"),
        ],
      }
    ],
  },
  mental_death: {
    triggers: [
      {
        event: evt.valueLoss("mental"),
        requirements: [req.valueLessThan("mental", 0)],
        effects: [
          eff.activateAction("sleep"),
          eff.sendMessage("SYSTEM", "You pass out from stress"),
        ],
      }
    ],
  },


  parent_xp: {
    tags: ["system"],
    triggers: [
      {
        event: evt.gainSkillXp(),
        effects: [
          eff.gainSkillXp(
            fml.skillParent(fml.contextSkill()),
            fml.contextAmount(),
           ),
        ]
      }
    ],
  },

  action_progress: {
    tags: ["system"],
    triggers: [
      {
        event: evt.tick(),
        effects: [
          eff.actionProgress(1),
        ]
      }
    ]
  },

  condition_decay: {
    tags: ["system"],
    triggers: [
      {
        event: evt.tick(),
        effects: [eff.decayConditionDurations()],
      },
    ],
  },

  action_exclusivity: {
    tags: ["system"],
    modifiers: [
      {
        event: evt.activateAction(),
        effects: [eff.deactivateAction(fml.activeAction())],
      }
    ]
  },

  action_test: {
    triggers: [
      {
        event: evt.actionChanges(),
        effects: [
          eff.sendMessage("SYSTEM", "TEST - action changed"),
        ]
      }
    ],
  },

  modifier_test: {
    modifiers: [
      {
        event: evt.changeValue("stamina"),
        effects: [
          eff.modifyAmount(0)
        ]
      }
    ]
  }

};

const TEMP_CONDITIONS = {
  sleeping: {
    name: "Sleeping",
    description: "You are asleep, greatly boosting your natural recovery",
    effects: [
      eff.changeConditionStrength(sel.conditionsByTag("passive_regen"), {flat: 10}),
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
      eff.skillLevelBonus("agility", {multiplier: 0.9}),
      eff.changeConditionStrength("stamina_regen", {multiplier: 0.7}),
    ],
  },
  
  cold: {
    name: "Cold",
    description:
      "You feel cold. You move and regenerate stamina slower. You have a slight mental drain.",
    effects: [eff.skillLevelBonus("agility", {multiplier: 0.7})]
  },

  injury: {
    name: "Injury",
    description: "Lorem ipsum dolor sit amet.",
    effects: [
 
    ],
  },
};


const TRAITS = {
  // Other forms can have different effects
  // TODO - add a way to make tagged conditions mutually exclusive
  human: {
    tags: ["form"],
    effects: [
      eff.changeValue("healthMax", 100),
      eff.changeValue("staminaMax", 100),
      eff.changeValue("mentalMax", 100),
    ],
  },

  rat_king: {
    tags: ["form", "beast", "rat"],
    effects: [
      eff.changeValue("healthMax", 80),
      eff.changeValue("staminaMax", 150),
      eff.changeValue("mentalMax", 70),
      eff.deactivateCondition("stamina_death"),
    ],
  },

}


const IMBALANCES = {
  /* Attribute Imbalance - apply effects if attribute x is more than attribute y, named as x_y
  * Should have a large effect on gameplay, and be thematic
  * Generally negative but with benefits to niche playstyles
  * Example effects (not final): 
  * Wit > Int makes powerful magic much less effective, but weaker magic gets a chance to cast twice
  * Agi > Con increases speed, but you take damage when moving fast
  * Con > Wil makes you take ~10% less damage, but when you lose health lose mental ~20% of the amount 
  */ 
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
  imbalance_str_dex: {
    requirements: [req.skillsImbalanced("strength", "dexterity")],
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
  imbalance_str_wit: {
    requirements: [req.skillsImbalanced("strength", "wit")],
    effects: [

    ],
  }, 
  imbalance_str_per: {
    requirements: [req.skillsImbalanced("strength", "perception")],
    effects: [

    ],
  }, 

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
  imbalance_con_dex: {
    requirements: [req.skillsImbalanced("constitution", "dexterity")],
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
  imbalance_con_wit: {
    requirements: [req.skillsImbalanced("constitution", "wit")],
    effects: [

    ],
  },
  imbalance_con_per: {
    requirements: [req.skillsImbalanced("constitution", "perception")],
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
  imbalance_agi_dex: {
    requirements: [req.skillsImbalanced("agility", "dexterity")],
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
  imbalance_agi_wit: {
    requirements: [req.skillsImbalanced("agility", "wit")],
    effects: [

    ],
  },
  imbalance_agi_per: {
    requirements: [req.skillsImbalanced("agility", "perception")],
    effects: [

    ],
  },

  imbalance_dex_str: {
    requirements: [req.skillsImbalanced("dexterity", "strength")],
    effects: [

    ],
  },
  imbalance_dex_con: {
    requirements: [req.skillsImbalanced("dexterity", "constitution")],
    effects: [

    ],
  },
  imbalance_dex_agi: {
    requirements: [req.skillsImbalanced("dexterity", "agility")],
    effects: [

    ],
  },
  imbalance_dex_int: {
    requirements: [req.skillsImbalanced("dexterity", "intelligence")],
    effects: [

    ],
  },
  imbalance_dex_wil: {
    requirements: [req.skillsImbalanced("dexterity", "willpower")],
    effects: [

    ],
  },
  imbalance_dex_wit: {
    requirements: [req.skillsImbalanced("dexterity", "wit")],
    effects: [

    ],
  },
  imbalance_dex_per: {
    requirements: [req.skillsImbalanced("dexterity", "perception")],
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
  imbalance_int_dex: {
    requirements: [req.skillsImbalanced("intelligence", "dexterity")],
    effects: [

    ],
  },
  imbalance_int_wil: {
    requirements: [req.skillsImbalanced("intelligence", "willpower")],
    effects: [

    ],
  },
  imbalance_int_wit: {
    requirements: [req.skillsImbalanced("intelligence", "wit")],
    effects: [

    ],
  },
  imbalance_int_per: {
    requirements: [req.skillsImbalanced("intelligence", "perception")],
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
  imbalance_wil_dex: { 
    requirements: [req.skillsImbalanced("willpower", "dexterity")], 
    effects: [

    ], 
  },
  imbalance_wil_int: { 
    requirements: [req.skillsImbalanced("willpower", "intelligence")], 
    effects: [

    ], 
  },
  imbalance_wil_wit: { 
    requirements: [req.skillsImbalanced("willpower", "wit")], 
    effects: [

    ], 
  },
  imbalance_wil_per: { 
    requirements: [req.skillsImbalanced("willpower", "perception")], 
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
  imbalance_wit_per: { 
    requirements: [req.skillsImbalanced("wit", "perception")],
    effects: [

    ], 
  },

  imbalance_per_str: { 
    requirements: [req.skillsImbalanced("perception", "strength")],
    effects: [

    ], 
  },
  imbalance_per_con: { 
    requirements: [req.skillsImbalanced("perception", "constitution")],
    effects: [

    ], 
  },
  imbalance_per_agi: { 
    requirements: [req.skillsImbalanced("perception", "agility")],
    effects: [

    ], 
  },
  imbalance_per_dex: { 
    requirements: [req.skillsImbalanced("perception", "dexterity")],
    effects: [

    ], 
  },
  imbalance_per_int: { 
    requirements: [req.skillsImbalanced("perception", "intelligence")],
    effects: [

    ], 
  },
  imbalance_per_wil: { 
    requirements: [req.skillsImbalanced("perception", "willpower")],
    effects: [

    ], 
  },
  imbalance_per_wit: { 
    requirements: [req.skillsImbalanced("perception", "wit")],
    effects: [

    ], 
  },
}


export const CONDITIONS = Object.assign({}, TEMP_CONDITIONS, TRAITS, INHERENT_EFFECTS, IMBALANCES);
