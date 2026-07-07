import { INHERENT_EFFECTS }         from "../data/conditionsData.js";
import { ACTIONS } from "../data/actionsData.js";
import { game }                                 from "./state.js";
import { initialiseState }                      from "../utils/state_creator.js";
import { EventLog }                    from "./log.js";
import { setIntervalFix, clearIntervalFix }     from "../utils/throttleFix.js";
import { processTrigger }                       from "./events.js";
import { applyEffect }                          from "./effects.js";

const TICK_RATE = 1000 / 20;

let intervalId = null;
export function startTicking(render) {
  initialiseState(game);

  game.log = new EventLog({ container: document.getElementById("log-box") });
  game.log.container.scrollTop = game.log.container.scrollHeight;
  game.log.followTail = true;

  // Bootstrap inherent effects (always-active pseudo-conditions)
  for (const conditionId in INHERENT_EFFECTS) {
    applyEffect(game, { type: "applyConditionInfinite", condition: conditionId });
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

  // TODO - refactor
  // Everything beyond this point is ugly temp code
  for (const conditionId in game.conditionStates) {
    const state = game.conditionStates[conditionId];
    if (!state.active)          continue;
    if (state.duration == null) continue;

    state.duration -= 1;
  }

  // If action has been changed by eff.setActiveAction, apply the effects 
  if (game.activeAction !== game.actionWithAppliedEffects) {
    if (game.actionWithAppliedEffects) {
      const state = game.actionStates[game.actionWithAppliedEffects];
      if (!state?.effectHolder) return;
      state.effectHolder.remove(game);
    }
    if (game.activeAction) {
      const state = game.actionStates[game.activeAction];
      if (!state?.effectHolder) return;
      state.effectHolder.apply(game);
    }
    game.actionWithAppliedEffects = game.activeAction;
  }

  // Grant attribute XP
  const action = ACTIONS[game.activeAction];
  if (action.attributes) {
    for (const id in action.attributes) {
      const amount = action.attributes[id];
      if (amount == 0) continue;
      applyEffect(game, {type:"grantSkillXp", skill:id, amount:amount});
    }
  }
}

