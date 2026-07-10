import { INHERENT_EFFECTS }         from "../data/conditionsData.js";
import { game }                                 from "./state.js";
import { initialiseState }                      from "../utils/state_creator.js";
import { EventLog }                    from "./log.js";
import { setIntervalFix, clearIntervalFix }     from "../utils/throttleFix.js";
import { processTrigger }                       from "./events.js";
import { applyEffect }                          from "./effects.js";

/*
* Validation
* - foo.effects must be array
*/

/* TODO
* - recalculation of passive effects on formula change
*   - preproccess of data, subscribing to values, events etc
* - Elegant attribute xp system. Maybe related to skills? 
*   - Each skill gives xp in some attributes, agility+con for running, etc 
*/

// TODO - figure out if this can easily be made dynamic
// I want chronomancy
const TICK_RATE = 1000 / 20;

let intervalId = null;
export function startTicking(render) {
  initialiseState(game);


  // TODO - refactor this somewhere else
  game.log = new EventLog({ container: document.getElementById("log-box") });
  game.log.container.scrollTop = game.log.container.scrollHeight;
  game.log.followTail = true;

  // TODO - make an elegant system for this
  for (const conditionId in INHERENT_EFFECTS) {
    applyEffect(game, { type: "activateCondition", condition: conditionId });
  }
  applyEffect(game, { type: "activateCondition", condition: "human" });
  applyEffect(game, { type: "setLocation", location: "new_meldrum"});
  applyEffect(game, { type: "activateAction", action: "sleep" });

  if (intervalId !== null) clearIntervalFix(intervalId);
  intervalId = setIntervalFix(() => {
    processTrigger(game, "tick");
    render(game);
  }, TICK_RATE);

  return () => {
    if (intervalId !== null) {
      clearIntervalFix(intervalId);
      intervalId = null;
    }
  };
}
