import { SKILLS } from "../data/skillsData.js";
import { LogType } from "./log.js";
import { applyEffect } from "./effects.js";
import { eff } from "../data/structure.js";

export function xpToNext(level) {
  // xpToNext = Math.floor(scalingFactor * Math.pow(2, level/5));
  // Math.floor(100 * Math.pow(level, scalingFactor))
  const scalingFactor = 100;
  return Math.floor(scalingFactor * Math.pow(2, level / 5));
}

export function grantSkillXp(game, skillId, amount) {
  const skill = game.skills[skillId];

  const xpForSkill = amount * game.skills[skillId].multiplier;
  skill.xp += xpForSkill; // TODO add modifiers
  while (skill.xp >= xpToNext(skill.base)) {
    skill.xp -= xpToNext(skill.base);
    skill.base++;

    const skillMessage = `${SKILLS[skillId].name} leveled to ${skill.base}`;
    game.log.append(LogType.SKILL, skillMessage);
  }
}

export function applySkillEffects(game) {
  for (const skillId in game.skills) {
    const skill = game.skills[skillId];
    const skillData = SKILLS[skillId];

    // Apply per-level effects
    for (let i = 1; i <= skill.level; i++) {
      for (const effect of skillData.level || []) applyEffect(game, effect);
    }
    // Apply milestone effects
    for (const milestoneLevel in skillData.milestones) {
      if (milestoneLevel > skill.level) break;
      const milestoneEffects = skillData.milestones[milestoneLevel];
      for (const effect of milestoneEffects) applyEffect(game, effect);
    }
  }
}
