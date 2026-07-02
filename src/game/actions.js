import { ACTIONS } from "../data/actionsData.js";
import { applyEffect, applyEffectTracked, removeEffect } from "./effects.js";
import { game } from "./state.js";


function calculateActionSkillFactor(game, action) {
  let factor = 0;
  for (const [skillId, skillFactor] of Object.entries(action.skills)) {
    const skill = game.skills[skillId];
    factor += skill.level * skillFactor * 0.01;
  }
  return factor;
}

function calculateActionAttributeFactor(game, action) {
  let factor = 0;
  for (const [attribute, attributeFactor] of Object.entries(action.attributes)) {
    factor += game.skills[attribute].level * attributeFactor * 0.01;
  }
  return factor;
}

export function calculateActionsCompetency(game) {
  for (const action in ACTIONS) {
    const skillFactor     = calculateActionSkillFactor(game, ACTIONS[action]);
    const attributeFactor = calculateActionAttributeFactor(game, ACTIONS[action]);
    game.actions[action].competency = 1 + skillFactor + attributeFactor;
  }
}

export function calculateActionCompetency(game, actionId) {
  const action = ACTIONS[actionId];
  game.actions[actionId] = game.actions[actionId] || {
    progress: 0, completions: 0, competency: 1, appliedEffects: [],
  };
  const skillFactor     = calculateActionSkillFactor(game, action);
  const attributeFactor = calculateActionAttributeFactor(game, action);
  game.actions[actionId].competency = 1 + skillFactor + attributeFactor;
}


// Actions can declare an `effects` array of passive modifiers 
// These are applied while the action is active
// And removed when action changes
// applyActionEffects   — call when an action becomes active
// removeActionEffects  — call when the active action changes or is cleared

// TODO - generalise this 
export function applyActionEffects(game, actionId) {
  const state = game.actions[actionId];
  if (!state?.effectHolder) return;
  state.effectHolder.apply(game);
}

export function removeActionEffects(game, actionId) {
  const state = game.actions[actionId];
  if (!state?.effectHolder) return;
  state.effectHolder.remove(game);
}


export function processAction() {
  const current_id = game.activeAction;

  const action = ACTIONS[current_id];
  if (action == undefined) console.warn("Current action not in ACTIONS:", current_id);
  if (!action) return;

  let duration = Math.ceil(action.duration / game.actions[current_id].competency);
  game.actions[current_id].progress += 1;

  // Grant attribute XP
  if (action.attributes) {
    for (const attribute in action.attributes) {
      const xpForSkill = action.attributes[attribute] * game.skills[attribute].xpMultiplier;
      game.skills[attribute].xp += xpForSkill;
    }
  }

  // Apply per-tick effects
  if (action.tick) {
    for (const effect of action.tick) {
      if (game.activeAction !== current_id) break; // action swapped mid-tick
      applyEffect(game, effect);
    }
  }

  // On completion
  if (game.actions[current_id].progress >= duration) {
    for (const effect of action.result) {
      applyEffect(game, effect);
    }
    game.actions[current_id].completions += 1;
    game.actions[current_id].progress = 0;
  }
}
