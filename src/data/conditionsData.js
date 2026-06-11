import { req, eff, evt, fml } from "./structure.js"

const INHERENT_EFFECTS = {
    // Will need to clamp max/min health 
    health_regen: {
        tags: ["passive_regen"],
        triggers: [
            evt.tick(),
        ],
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
        triggers: [
            evt.tick(),
        ],
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
        triggers: [
            evt.tick(),
        ],
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
            ]
        ],
        effects: [
            eff.setActiveAction("sleeping"),
            eff.sendMessage("SYSTEM", "You pass out"),
        ]
    },
     
    parent_xp: {
        triggers: [
            evt.gainSkillXp(),
        ],
        effects: [
            eff.grantSkillXp(
                fml.skillParent(fml.contextSkill()), 
                fml.contextAmount(),
            ),
        ],
    },

}

const TEMP_CONDITIONS = {
    sleeping: {
        name: "Sleeping",
        description: "You are asleep, greatly boosting your natural recovery",
        effects: [     
            eff.changeConditionTagStrength("passive_regen", 10),
        ],
    },

    wet: {
        name:"Wet",
        description:"You're soaked. Lowers cold resistance, increases fire resistance",
        effects: [],
    },

    chilly: {
        name:"Chilly",
        description:"You feel chilly. You move and regenerate stamina slightly slower",
        effects: [eff.skillLevelBonus("agility", 0, -0.1), eff.changeConditionStrength("stamina_regen", -0.1)],
    },

    cold: {
        name:"Cold",
        description:"You feel cold. You move and regenerate stamina slower. You have a slight mental drain.",
        effects: [eff.skillLevelBonus("agility", 0, -0.2)],
    },


    combat_fatigue: {
        name:"Combat Fatigue",
        description:"The chaos of battle is getting to you. You're getting stressed and fatigued",
        effects: [
            eff.changeResource("stamina", -1),
            eff.changeResource("mental", -1),
        ],
    },
}



export const CONDITIONS = Object.assign({}, TEMP_CONDITIONS, INHERENT_EFFECTS);
