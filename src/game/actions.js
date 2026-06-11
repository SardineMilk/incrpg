import { ACTIONS } from "../data/actionsData.js";

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
  for (const [attribute, attributeFactor] of Object.entries(
    action.attributes,
  )) {
    factor += game.skills[attribute].level * attributeFactor * 0.01;
  }
  return factor;
}

export function calculateActionsCompetency(game) {
  for (const action in ACTIONS) {
    game.actions[action] = game.actions[action] || {
      progress: 0,
      completions: 0,
      competency: 1,
    };
    const skillFactor = calculateActionSkillFactor(game, ACTIONS[action]);
    const attributeFactor = calculateActionAttributeFactor(
      game,
      ACTIONS[action],
    );
    game.actions[action].competency = 1 + skillFactor + attributeFactor;
  }
}

export function calculateActionCompetency(game, actionId) {
  const action = ACTIONS[actionId];
  game.actions[actionId] = game.actions[actionId] || {
    progress: 0,
    completions: 0,
    competency: 1,
  };
  const skillFactor = calculateActionSkillFactor(game, action);
  const attributeFactor = calculateActionAttributeFactor(game, action);
  game.actions[actionId].competency = 1 + skillFactor + attributeFactor;
}
