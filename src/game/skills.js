import { SKILLS } from "../data/skillsData.js";
import { LogType } from "./log.js";
import { applyEffect } from "./effects.js";
import { eff } from "../structures/structures.js";

export function xpToNext(level) {
  // xpToNext = Math.floor(scalingFactor * Math.pow(2, level/5));
  // Math.floor(100 * Math.pow(level, scalingFactor))
  const scalingFactor = 100;
  return Math.floor(scalingFactor * Math.pow(2, level / 5));
}


export function processSkills(game) {
  /*
  * Loops through skills, checking if they need to level up
  * Also applies any new effects gained by leveling up
  */
  for (const skillId in game.skills) {
    const skill = game.skills[skillId];
    const skillData = SKILLS[skillId];

    // Level up skills
    while (skill.xp >= xpToNext(skill.base)) {
      skill.xp -= xpToNext(skill.base);
      skill.base++;
      skill.level = (skill.base + skill.bonus.flat) * skill.bonus.percent * skill.bonus.multiplier

      // Skill level effects
      for (const effect of skillData.level || []) applyEffect(game, effect);

      // Milestone effects
      // TODO this is slow
      for (const milestoneLevel in skillData.milestones) {
        if (milestoneLevel != skill.level) continue;
        const milestoneEffects = skillData.milestones[milestoneLevel];
        for (const effect of milestoneEffects) applyEffect(game, effect);
      }

      const skillMessage = `${SKILLS[skillId].name} leveled to ${skill.base}`;
      game.log.append(LogType.SKILL, skillMessage);
    }

  }
}
