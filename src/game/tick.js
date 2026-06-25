import { ACTIONS } from "../data/actionsData.js";
import { INHERENT_EFFECTS, CONDITIONS } from "../data/conditionsData.js";
import { applySkillEffects } from "./skills.js";
import { game } from "./state.js";
import { initialiseState } from "../utils/state_creator.js";
import {
  calculateActionCompetency,
  calculateActionsCompetency,
} from "./actions.js";
import { applyCondition, decrementConditionDuration } from "./conditions.js";
import { LogType, EventLog } from "./log.js";
import { setIntervalFix, clearIntervalFix } from "../utils/throttleFix.js";
import {eff, req, evt, sel, fml } from "../structures/structures.js";
import { processTrigger } from "./events.js";
import { applyEffect } from "./effects.js";
import { applyScaledEffect } from "./effects.js";
import { resolveStatLayer } from "../utils/statLayer.js";

const TICK_RATE = 1000 / 20;

let intervalId = null;
export function startTicking(render) {
  initialiseState(game);

  // TODO factor this out
  game.log = new EventLog({ container: document.getElementById("log-box") });
  game.log.container.scrollTop = game.log.container.scrollHeight;
  game.log.followTail = true;

  for (const conditionId in INHERENT_EFFECTS) {
    applyCondition(conditionId);
  }


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
  decrementConditionDuration(game);
  processTrigger(game, "tick");

  // TODO remove effects
  for (const conditionId in game.conditionStates) {
    const c = game.conditionStates[conditionId];
    if (!c.active) continue;
    if (!c.new) continue;
    c.new = false;
    const def = CONDITIONS[conditionId];
    if (!def.effects) return;
    const conditionStrength = resolveStatLayer(c.strength);
    c.strengthOnApply = conditionStrength;  // Used to invert effects with correct strength
    for (const effect of def.effects) {
      // Should be applyEffect()? Harder to remove
      applyScaledEffect(game, effect, conditionStrength);
    }
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
      const xpForSkill = action.attributes[attribute] * game.skills[attribute].xpMultiplier;
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
