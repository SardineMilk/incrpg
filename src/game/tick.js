import { ACTIONS } from "../data/actionsData.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { applyEffect } from "./effects.js";
import { applySkillEffects } from "./skills.js";
import { game } from "./state.js";
import { initialiseState } from "../utils/state_creator.js";
import {
  calculateActionCompetency,
  calculateActionsCompetency,
} from "./actions.js";
import { processConditions } from "./conditions.js";
import { LogType, EventLog } from "./log.js";
import { setIntervalFix, clearIntervalFix } from "../utils/throttleFix.js";
import { eff } from "../data/effectDefs.js";
const TICK_RATE = 1000 / 20;

let intervalId = null;
export function startTicking(render) {
  initialiseState(game);

  // TODO factor this out
  game.log = new EventLog({ container: document.getElementById("log-box") });
  game.log.container.scrollTop = game.log.container.scrollHeight;
  game.log.followTail = true;

  if (intervalId !== null) {
    clearIntervalFix(intervalId);
  }

  intervalId = setIntervalFix(() => {
    tick();
    render(game);
  }, TICK_RATE);

  return () => {
    if (intervalId !== null) {
      clearIntervalFix(intervalId);
      intervalId = null;
    }
  };
}

function tick() {
  applyEffect(game, { type: "tick" });

  // TODO proper state wipe system
  for (const skillId in game.skills) {
    game.skills[skillId].multiplier = 1;
    game.skills[skillId].bonus.flat = 0;
    game.skills[skillId].bonus.multiplier = 1;
  }
  for (const conditionId in game.activeConditions) {
    game.activeConditions[conditionId].strength = 1;
  }
  for (const resourceId in game.resources) {
    game.resources[resourceId].max = 100;
  }

  processConditions(game);

  for (const skillId in game.skills) {
    const skill = game.skills[skillId];
    game.skills[skillId].level =
      (skill.base + skill.bonus.flat) * skill.bonus.multiplier;
  }

  applySkillEffects(game);

  // TODO limit this to only visible actions
  calculateActionsCompetency(game);
  // calculateActionCompetency(game, game.activeAction);

  if (game.activeAction) {
    processAction();
  }
}

function processAction() {
  const current_id = game.activeAction;
  const action = ACTIONS[current_id];
  if (action == undefined) console.warn("Current action not in ACTIONS: ", current_id);
  let duration = Math.ceil(
    action.duration / game.actions[current_id].competency,
  );
  game.actions[current_id].progress += 1;

  // Grant attribute xp
  if (action.attributes) {
    for (const attribute in action.attributes) {
      const xpForSkill = action.attributes[attribute] * game.skills[attribute].multiplier;
      game.skills[attribute].xp += xpForSkill;
    }
  }

  // Apply tick effects
  if (action.tick) {
    for (const effect of action.tick) {
      if (game.activeAction !== current_id) break; // If effect causes action to be changed. Maybe remove?
      applyEffect(game, effect);
    }
  }

  // Completion
  if (game.actions[current_id].progress >= duration) {
    for (const effect of action.result) {
      applyEffect(game, effect);
    }
    game.actions[current_id].completions += 1;
    game.actions[current_id].progress = 0;
  }
}
