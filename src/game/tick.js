import { ACTIONS }                              from "../data/actionsData.js";
import { INHERENT_EFFECTS, CONDITIONS }         from "../data/conditionsData.js";
import { processSkills }                    from "./skills.js";
import { game }                                 from "./state.js";
import { initialiseState }                      from "../utils/state_creator.js";
import { calculateActionsCompetency }           from "./actions.js";
import { applyActionEffects, removeActionEffects } from "./actions.js";
import {
  processConditions
} from "./conditions.js";
import { LogType, EventLog }                    from "./log.js";
import { setIntervalFix, clearIntervalFix }     from "../utils/throttleFix.js";
import { processTrigger }                       from "./events.js";
import { applyEffect }                          from "./effects.js";
import { applyScaledEffect }                    from "./effects.js";

const TICK_RATE = 1000 / 20;

let intervalId = null;
export function startTicking(render) {
  initialiseState(game);

  game.log = new EventLog({ container: document.getElementById("log-box") });
  game.log.container.scrollTop = game.log.container.scrollHeight;
  game.log.followTail = true;

  // Bootstrap inherent effects (always-active pseudo-conditions)
  for (const conditionId in INHERENT_EFFECTS) {
    applyEffect(game, { type: "applyCondition", condition: conditionId });
  }

  if (intervalId !== null) clearIntervalFix(intervalId);

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
  processTrigger(game, "tick");

  processConditions(game);

  processSkills(game);

  // If action has been changed by eff.setActiveAction, apply the effects 
  if (game.activeAction !== game.actionWithAppliedEffects) {
    if (game.actionWithAppliedEffects) removeActionEffects(game, game.actionWithAppliedEffects);
    if (game.activeAction) applyActionEffects(game, game.activeAction);
    game.actionWithAppliedEffects = game.activeAction;
  }

  calculateActionsCompetency(game);

  if (game.activeAction) {
    processAction();
  }
}

function processAction() {
  const current_id = game.activeAction;
  const action = ACTIONS[current_id];
  if (action == undefined) console.warn("Current action not in ACTIONS:", current_id);

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
    game.actions[current_id].progress    = 0;
  }
}