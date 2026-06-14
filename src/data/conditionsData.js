import { eff } from "./effectDefs.js";
import { req } from "./requirementDefs.js";
import { evt } from "./triggerDefs.js";
import { fml } from "./formulaDefs.js";

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
      eff.setActiveAction("sleep"),
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


  /* Attribute Imbalance - apply effects if attribute x is more than attribute y, named as x_y
  * Should have a large effect on gameplay, and be thematic
  * Generally negative but with benefits to niche playstyles
  * Example effects (not final): 
  * Wit > Int makes powerful magic much less effective, but weaker magic gets a chance to cast twice
  * Agi > Con increases speed, but you take damage when moving fast
  * Con > Wil makes you take ~10% less damage, but when you lose health lose mental ~20% of the amount 
  */ 
  imbalance_str_con: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("strength"), 2),  fml.skillLevel("constitution")),
      req.moreThan(fml.sub(fml.skillLevel("strength"), fml.skillLevel("constitution")), 10),
    ],
    effects: [

    ],
  },
  imbalance_str_agi: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("strength"), 2),  fml.skillLevel("agility")),
      req.moreThan(fml.sub(fml.skillLevel("strength"), fml.skillLevel("agility")), 10),
    ],
    effects: [

    ],
  },
  imbalance_str_dex: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("strength"), 2),  fml.skillLevel("dexterity")),
      req.moreThan(fml.sub(fml.skillLevel("strength"), fml.skillLevel("dexterity")), 10),
    ],
    effects: [

    ],
  },
  imbalance_str_int: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("strength"), 2),  fml.skillLevel("intelligence")),
      req.moreThan(fml.sub(fml.skillLevel("strength"), fml.skillLevel("intelligence")), 10),
    ],
    effects: [

    ],
  },
  imbalance_str_wil: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("strength"), 2),  fml.skillLevel("willpower")),
      req.moreThan(fml.sub(fml.skillLevel("strength"), fml.skillLevel("willpower")), 10),
    ],
    effects: [

    ],
  }, 
  imbalance_str_wit: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("strength"), 2),  fml.skillLevel("wit")),
      req.moreThan(fml.sub(fml.skillLevel("strength"), fml.skillLevel("wit")), 10),
    ],
    effects: [

    ],
  }, 
  imbalance_str_per: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("strength"), 2),  fml.skillLevel("perception")),
      req.moreThan(fml.sub(fml.skillLevel("strength"), fml.skillLevel("perception")), 10),
    ],
    effects: [

    ],
  }, 

  imbalance_con_str: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("constitution"), 2), fml.skillLevel("strength")),
      req.moreThan(fml.sub(fml.skillLevel("constitution"), fml.skillLevel("strength")), 10),
    ],
    effects: [

    ],
  },
  imbalance_con_agi: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("constitution"), 2), fml.skillLevel("agility")),
      req.moreThan(fml.sub(fml.skillLevel("constitution"), fml.skillLevel("agility")), 10),
    ],
    effects: [

    ],
  },
  imbalance_con_dex: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("constitution"), 2), fml.skillLevel("dexterity")),
      req.moreThan(fml.sub(fml.skillLevel("constitution"), fml.skillLevel("dexterity")), 10),
    ],
    effects: [

    ],
  },
  imbalance_con_int: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("constitution"), 2), fml.skillLevel("intelligence")),
      req.moreThan(fml.sub(fml.skillLevel("constitution"), fml.skillLevel("intelligence")), 10),
    ],
    effects: [

    ],
  },
  imbalance_con_wil: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("constitution"), 2), fml.skillLevel("willpower")),
      req.moreThan(fml.sub(fml.skillLevel("constitution"), fml.skillLevel("willpower")), 10),
    ],
    effects: [

    ],
  },
  imbalance_con_wit: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("constitution"), 2), fml.skillLevel("wit")),
      req.moreThan(fml.sub(fml.skillLevel("constitution"), fml.skillLevel("wit")), 10),
    ],
    effects: [

    ],
  },
  imbalance_con_per: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("constitution"), 2), fml.skillLevel("perception")),
      req.moreThan(fml.sub(fml.skillLevel("constitution"), fml.skillLevel("perception")), 10),
    ],
    effects: [

    ],
  },

  imbalance_agi_str: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("agility"), 2), fml.skillLevel("strength")),
      req.moreThan(fml.sub(fml.skillLevel("agility"), fml.skillLevel("strength")), 10),
    ],
    effects: [

    ],
  },
  imbalance_agi_con: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("agility"), 2), fml.skillLevel("constitution")),
      req.moreThan(fml.sub(fml.skillLevel("agility"), fml.skillLevel("constitution")), 10),
    ],
    effects: [

    ],
  },
  imbalance_agi_dex: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("agility"), 2), fml.skillLevel("dexterity")),
      req.moreThan(fml.sub(fml.skillLevel("agility"), fml.skillLevel("dexterity")), 10),
    ],
    effects: [

    ],
  },
  imbalance_agi_int: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("agility"), 2), fml.skillLevel("intelligence")),
      req.moreThan(fml.sub(fml.skillLevel("agility"), fml.skillLevel("intelligence")), 10),
    ],
    effects: [

    ],
  },
  imbalance_agi_wil: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("agility"), 2), fml.skillLevel("willpower")),
      req.moreThan(fml.sub(fml.skillLevel("agility"), fml.skillLevel("willpower")), 10),
    ],
    effects: [

    ],
  },
  imbalance_agi_wit: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("agility"), 2), fml.skillLevel("wit")),
      req.moreThan(fml.sub(fml.skillLevel("agility"), fml.skillLevel("wit")), 10),
    ],
    effects: [

    ],
  },
  imbalance_agi_per: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("agility"), 2), fml.skillLevel("perception")),
      req.moreThan(fml.sub(fml.skillLevel("agility"), fml.skillLevel("perception")), 10),
    ],
    effects: [

    ],
  },

  imbalance_dex_str: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("dexterity"), 2), fml.skillLevel("strength")),
      req.moreThan(fml.sub(fml.skillLevel("dexterity"), fml.skillLevel("strength")), 10),
    ],
    effects: [

    ],
  },
  imbalance_dex_con: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("dexterity"), 2), fml.skillLevel("constitution")),
      req.moreThan(fml.sub(fml.skillLevel("dexterity"), fml.skillLevel("constitution")), 10),
    ],
    effects: [

    ],
  },
  imbalance_dex_agi: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("dexterity"), 2), fml.skillLevel("agility")),
      req.moreThan(fml.sub(fml.skillLevel("dexterity"), fml.skillLevel("agility")), 10),
    ],
    effects: [

    ],
  },
  imbalance_dex_int: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("dexterity"), 2), fml.skillLevel("intelligence")),
      req.moreThan(fml.sub(fml.skillLevel("dexterity"), fml.skillLevel("intelligence")), 10),
    ],
    effects: [

    ],
  },
  imbalance_dex_wil: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("dexterity"), 2), fml.skillLevel("willpower")),
      req.moreThan(fml.sub(fml.skillLevel("dexterity"), fml.skillLevel("willpower")), 10),
    ],
    effects: [

    ],
  },
  imbalance_dex_wit: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("dexterity"), 2), fml.skillLevel("wit")),
      req.moreThan(fml.sub(fml.skillLevel("dexterity"), fml.skillLevel("wit")), 10),
    ],
    effects: [

    ],
  },
  imbalance_dex_per: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("dexterity"), 2), fml.skillLevel("perception")),
      req.moreThan(fml.sub(fml.skillLevel("dexterity"), fml.skillLevel("perception")), 10),
    ],
    effects: [

    ],
  },

  imbalance_int_str: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("intelligence"), 2), fml.skillLevel("strength")),
      req.moreThan(fml.sub(fml.skillLevel("intelligence"), fml.skillLevel("strength")), 10),
    ],
    effects: [

    ],
  },
  imbalance_int_con: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("intelligence"), 2), fml.skillLevel("constitution")),
      req.moreThan(fml.sub(fml.skillLevel("intelligence"), fml.skillLevel("constitution")), 10),
    ],
    effects: [

    ],
  },
  imbalance_int_agi: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("intelligence"), 2), fml.skillLevel("agility")),
      req.moreThan(fml.sub(fml.skillLevel("intelligence"), fml.skillLevel("agility")), 10),
    ],
    effects: [

    ],
  },
  imbalance_int_dex: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("intelligence"), 2), fml.skillLevel("dexterity")),
      req.moreThan(fml.sub(fml.skillLevel("intelligence"), fml.skillLevel("dexterity")), 10),
    ],
    effects: [

    ],
  },
  imbalance_int_wil: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("intelligence"), 2), fml.skillLevel("willpower")),
      req.moreThan(fml.sub(fml.skillLevel("intelligence"), fml.skillLevel("willpower")), 10),
    ],
    effects: [

    ],
  },
  imbalance_int_wit: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("intelligence"), 2), fml.skillLevel("wit")),
      req.moreThan(fml.sub(fml.skillLevel("intelligence"), fml.skillLevel("wit")), 10),
    ],
    effects: [

    ],
  },
  imbalance_int_per: {
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("intelligence"), 2), fml.skillLevel("perception")),
      req.moreThan(fml.sub(fml.skillLevel("intelligence"), fml.skillLevel("perception")), 10),
    ],
    effects: [

    ],
  },

  imbalance_wil_str: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("willpower"), 2), fml.skillLevel("strength")), 
      req.moreThan(fml.sub(fml.skillLevel("willpower"), fml.skillLevel("strength")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_wil_con: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("willpower"), 2), fml.skillLevel("constitution")), 
      req.moreThan(fml.sub(fml.skillLevel("willpower"), fml.skillLevel("constitution")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_wil_agi: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("willpower"), 2), fml.skillLevel("agility")), 
      req.moreThan(fml.sub(fml.skillLevel("willpower"), fml.skillLevel("agility")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_wil_dex: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("willpower"), 2), fml.skillLevel("dexterity")), 
      req.moreThan(fml.sub(fml.skillLevel("willpower"), fml.skillLevel("dexterity")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_wil_int: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("willpower"), 2), fml.skillLevel("intelligence")), 
      req.moreThan(fml.sub(fml.skillLevel("willpower"), fml.skillLevel("intelligence")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_wil_wit: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("willpower"), 2), fml.skillLevel("wit")), 
      req.moreThan(fml.sub(fml.skillLevel("willpower"), fml.skillLevel("wit")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_wil_per: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("willpower"), 2), fml.skillLevel("perception")), 
      req.moreThan(fml.sub(fml.skillLevel("willpower"), fml.skillLevel("perception")), 10)
    ],
    effects: [

    ], 
  },

  imbalance_wit_str: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("wit"), 2), fml.skillLevel("strength")),
      req.moreThan(fml.sub(fml.skillLevel("wit"), fml.skillLevel("strength")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_wit_con: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("wit"), 2), fml.skillLevel("constitution")),
      req.moreThan(fml.sub(fml.skillLevel("wit"), fml.skillLevel("constitution")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_wit_agi: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("wit"), 2), fml.skillLevel("agility")),
      req.moreThan(fml.sub(fml.skillLevel("wit"), fml.skillLevel("agility")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_wit_dex: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("wit"), 2), fml.skillLevel("dexterity")),
      req.moreThan(fml.sub(fml.skillLevel("wit"), fml.skillLevel("dexterity")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_wit_int: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("wit"), 2), fml.skillLevel("intelligence")),
      req.moreThan(fml.sub(fml.skillLevel("wit"), fml.skillLevel("intelligence")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_wit_wil: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("wit"), 2), fml.skillLevel("willpower")),
      req.moreThan(fml.sub(fml.skillLevel("wit"), fml.skillLevel("willpower")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_wit_per: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("wit"), 2), fml.skillLevel("perception")),
      req.moreThan(fml.sub(fml.skillLevel("wit"), fml.skillLevel("perception")), 10)
    ],
    effects: [

    ], 
  },

  imbalance_per_str: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("perception"), 2), fml.skillLevel("strength")),
      req.moreThan(fml.sub(fml.skillLevel("perception"), fml.skillLevel("strength")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_per_con: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("perception"), 2), fml.skillLevel("constitution")),
      req.moreThan(fml.sub(fml.skillLevel("perception"), fml.skillLevel("constitution")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_per_agi: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("perception"), 2), fml.skillLevel("agility")),
      req.moreThan(fml.sub(fml.skillLevel("perception"), fml.skillLevel("agility")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_per_dex: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("perception"), 2), fml.skillLevel("dexterity")),
      req.moreThan(fml.sub(fml.skillLevel("perception"), fml.skillLevel("dexterity")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_per_int: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("perception"), 2), fml.skillLevel("intelligence")),
      req.moreThan(fml.sub(fml.skillLevel("perception"), fml.skillLevel("intelligence")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_per_wil: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("perception"), 2), fml.skillLevel("willpower")),
      req.moreThan(fml.sub(fml.skillLevel("perception"), fml.skillLevel("willpower")), 10)
    ],
    effects: [

    ], 
  },
  imbalance_per_wit: { 
    requirements: [
      req.moreThan(fml.div(fml.skillLevel("perception"), 2), fml.skillLevel("wit")),
      req.moreThan(fml.sub(fml.skillLevel("perception"), fml.skillLevel("wit")), 10)
    ],
    effects: [

    ], 
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
    effects: [

    ],
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
