import { INHERENT_EFFECTS }         from "../data/conditionsData.js";
import { game }                                 from "./state.js";
import { initialiseState }                      from "../utils/state_creator.js";
import { EventLog }                    from "./log.js";
import { setIntervalFix, clearIntervalFix }     from "../utils/throttleFix.js";
import { processModifier, processTrigger }                       from "./events.js";
import { applyEffect }                          from "./effects.js";


/* TODO
* - Elegant attribute xp system. Maybe related to skills? 
*   - Each skill gives xp in some attributes, agility+con for running, etc 
*   - Each skill has parent of attribute
*   - Attributes are StatLayers rather than skills
*     - They increase the strength of "stat_effect" conditions
*
* - Dynamic passive/level effect handling
* - Activities system
*   - Allow expansion into combat
* - Items
* - UI framework
*/


// TODO - figure out if this can easily be made dynamic
// I want chronomancy
const TICK_RATE = 1000 / 10;

let intervalId = null;
export function startTicking(render) {
  initialiseState(game);

  // TODO - refactor this somewhere else
  game.log = new EventLog({ container: document.getElementById("log-box") });
  game.log.container.scrollTop = game.log.container.scrollHeight;
  game.log.followTail = true;

  applyEffect(game, { type: "activate", id: "startup" });

  if (intervalId !== null) clearIntervalFix(intervalId);
  intervalId = setIntervalFix(() => {
    processModifier(game, "tick", {});
    processTrigger(game, "tick", {});
    render(game);
  }, TICK_RATE);

  return () => {
    if (intervalId !== null) {
      clearIntervalFix(intervalId);
      intervalId = null;
    }
  };
}
