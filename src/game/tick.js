import { INHERENT_EFFECTS }         from "../data/conditionsData.js";
import { processSkills }                    from "./skills.js";
import { game }                                 from "./state.js";
import { initialiseState }                      from "../utils/state_creator.js";
import { calculateActionsCompetency, processAction }           from "./actions.js";
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
  processAction();
}

