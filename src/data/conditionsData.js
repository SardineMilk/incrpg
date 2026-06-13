import { req, eff, evt, fml } from "./structure.js";

// Need to special-case these. Apply all at start of game
// Inherent Effects are always active, and may have strict requirements or triggers
const INHERENT_EFFECTS = {
  // Will need to clamp max/min health
  health_regen: {
    tags: ["passive_regen"],
    triggers: [evt.tick()],
    requirements: [
      req.resourceUnderMaxBy("health", fml.conditionStrength("health_regen")),
    ],
    effects: [
      eff.changeResource("health", 1),
      eff.grantSkillXp("regeneration", 0.1),
    ],
  },
  stamina_regen: {
    tags: ["passive_regen"],
    triggers: [evt.tick()],
    requirements: [
      req.resourceUnderMaxBy("stamina", fml.conditionStrength("stamina_regen")),
    ],
    effects: [
      eff.changeResource("stamina", 1),
      eff.grantSkillXp("breathing", 0.1),
    ],
  },
  mental_regen: {
    tags: ["passive_regen"],
    triggers: [evt.tick()],
    requirements: [
      req.resourceUnderMaxBy("mental", fml.conditionStrength("mental_regen")),
    ],
    effects: [
      eff.changeResource("mental", 1),
      eff.grantSkillXp("mindfulness", 0.1),
    ],
  },

  death: {
    triggers: [
      evt.resourceLoss("health"),
      evt.resourceLoss("stamina"),
      evt.resourceLoss("mental"),
    ],
    requirements: [
      [
        req.resourceLessThan("health", 0),
        req.resourceLessThan("stamina", 0),
        req.resourceLessThan("mental", 0),
      ],
    ],
    effects: [
      eff.setActiveAction("sleeping"),
      eff.sendMessage("SYSTEM", "You pass out"),
    ],
  },

  parent_xp: {
    triggers: [evt.gainSkillXp()],
    effects: [
      eff.grantSkillXp(
        fml.skillParent(fml.contextSkill()),
        fml.contextAmount(),
      ),
    ],
  },


  // Attribute Imbalance - apply effects if attribute x is more than attribute y, named as x_y
  imbalance_str_con: {
    requirements: [req.moreThan(fml.skillLevel("strength"),  fml.skillLevel("constitution"))],
    effects: [
      eff.changeConditionStrength("imbalance_str_con", fml.sub(fml.skillLevel("strength"),  fml.skillLevel("constitution")))
    ]
  },
  imbalance_str_agi: {
    requirements: [req.moreThan(fml.skillLevel("strength"),  fml.skillLevel("agility"))],
    effects: [
      eff.changeConditionStrength("imbalance_str_agi", fml.sub(fml.skillLevel("strength"),  fml.skillLevel("agility")))
    ]
  },
  imbalance_str_dex: {
    requirements: [req.moreThan(fml.skillLevel("strength"),  fml.skillLevel("dexterity"))],
    effects: [
      eff.changeConditionStrength("imbalance_str_dex", fml.sub(fml.skillLevel("strength"),  fml.skillLevel("dexterity")))
    ]
  },
  imbalance_str_int: {
    requirements: [req.moreThan(fml.skillLevel("strength"),  fml.skillLevel("intelligence"))],
    effects: [
      eff.changeConditionStrength("imbalance_str_int", fml.sub(fml.skillLevel("strength"),  fml.skillLevel("intelligence")))
    ]
  },
  imbalance_str_wil: {
    requirements: [req.moreThan(fml.skillLevel("strength"),  fml.skillLevel("willpower"))],
    effects: [
      eff.changeConditionStrength("imbalance_str_wil", fml.sub(fml.skillLevel("strength"),  fml.skillLevel("willpower")))
    ]
  }, 
  imbalance_str_wit: {
    requirements: [req.moreThan(fml.skillLevel("strength"),  fml.skillLevel("wit"))],
    effects: [
      eff.changeConditionStrength("imbalance_str_wit", fml.sub(fml.skillLevel("strength"),  fml.skillLevel("wit")))
    ]
  }, 
  imbalance_str_per: {
    requirements: [req.moreThan(fml.skillLevel("strength"),  fml.skillLevel("perception"))],
    effects: [
      eff.changeConditionStrength("imbalance_str_per", fml.sub(fml.skillLevel("strength"),  fml.skillLevel("perception")))
    ]
  }, 

};

const TEMP_CONDITIONS = {
  sleeping: {
    name: "Sleeping",
    description: "You are asleep, greatly boosting your natural recovery",
    effects: [eff.changeConditionTagStrength("passive_regen", 10)],
  },

  wet: {
    name: "Wet",
    description:
      "You're soaked. Lowers cold resistance, increases fire resistance",
    effects: [],
  },

  chilly: {
    name: "Chilly",
    description:
      "You feel chilly. You move and regenerate stamina slightly slower",
    effects: [
      eff.skillLevelBonus("agility", 0, -0.1),
      eff.changeConditionStrength("stamina_regen", -0.1),
    ],
  },

  cold: {
    name: "Cold",
    description:
      "You feel cold. You move and regenerate stamina slower. You have a slight mental drain.",
    effects: [eff.skillLevelBonus("agility", 0, -0.2)],
  },

  combat_fatigue: {
    name: "Combat Fatigue",
    description:
      "The chaos of battle is getting to you. You're getting stressed and fatigued",
    effects: [
      eff.changeResource("stamina", -1),
      eff.changeResource("mental", -1),
    ],
  },
};

export const CONDITIONS = Object.assign({}, TEMP_CONDITIONS, INHERENT_EFFECTS);
