export function validate(conditions, skills, actions) {
    console.log("Static Validation: ")
    console.log("- checking for duplicate ids");
    checkDuplicateIds({ conditions, skills, actions });

    console.log("- checking for dynamic level effects");
    checkStaticLevelEffects(skills);

}

function checkDuplicateIds(collections) {
  const seenIn = new Map(); // id -> collection name it was first seen in

  for (const [collectionId, collection] of Object.entries(collections)) {
    for (const id in collection) {
      const existing = seenIn.get(id);
      if (existing) {
        console.warn(`Duplicated ID: ${id}`);
        continue;
      }
      seenIn.set(id, collectionId);
    }
  }
}


/*
* Guarantee LevelHolder.level and LevelHolder.milestones are static
* They cannot have dynamic, game-state dependant formulas
* - there isn't a system in place to to reapply if the formula result changes
* 
* To properly implement this functionality:
* - Create a condition with a dynamic passive effect
* - Apply condition/ change strength from the level effects/milestones
*/
function checkStaticLevelEffects(skills) {
  for (const [skillId, skill] of Object.entries(skills)) {
    checkEffectListIsStatic(skillId, "level", skill.level ?? []);

    for (const [milestoneLevel, effects] of Object.entries(skill.milestones ?? {})) {
      checkEffectListIsStatic(skillId, `milestones[${milestoneLevel}]`, effects);
    }
  }
}

function checkEffectListIsStatic(entityId, listName, effects) {
    const nonStaticFormulaIds = ["context"];
    for (const effect of effects) {
        for (const [field, value] of Object.entries(effect)) {
            if (nonStaticFormulaIds.includes(field)) {
                console.warn(`Non-static effect in skill: ${entityId}`);
            }
        }
    }
}