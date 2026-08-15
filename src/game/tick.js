import { INHERENT_EFFECTS }         from "../data/conditionsData.js";
import { initialiseState }                      from "../utils/state_creator.js";
import { EventLog }                    from "./log.js";
import { setIntervalFix, clearIntervalFix }     from "../utils/throttleFix.js";
import { processTrigger }                       from "./events.js";
import { applyEffect }                          from "./effects.js";
import { hasStoredSave, loadFromStorage, saveToStorage } from "../utils/save.js";


/* TODO
* - Elegant attribute xp system. Maybe related to skills? 
*   - Each skill gives xp in some attributes, agility+con for running, etc 
*   - Each skill has parent of attribute
*   - Attributes are StatLayers rather than skills
*     - They increase the strength of "stat_effect" conditions
*     - Increased mostly by milestones
*   - Using hp/sp/mp grants xp in related attributes
*     - 1hp = 1 con, 0.5 str, 0.5 wil
*
* - Combat system
* - Items
* - UI framework
* - Visibility requirements
*   - uses req.foo()
*   - used to determine if it should be shown in UI
* - Save/loading
*   - determine what data needs saved, and how
*   - can `game` just get slapped into a file?
*/


// TODO - figure out if this can easily be made dynamic
const TICK_RATE = 1000 / 10;

let tickCounter = 0;
let intervalId = null;
export function startTicking(render) {
  let game;
  if (hasStoredSave()) {
    game = loadFromStorage();
  } else {
    game = initialiseState();
  }

  game.log = new EventLog({ container: document.getElementById("log-box") });
  game.log.container.scrollTop = game.log.container.scrollHeight;
  game.log.followTail = true;

  if (!hasStoredSave()) applyEffect(game, { type: "activate", id: "startup" });

  window.game = game


  if (intervalId !== null) clearIntervalFix(intervalId);
  intervalId = setIntervalFix(() => {
    processTrigger(game, "tick", {}, "pre");
    processTrigger(game, "tick", {}, "post");
    render(game);

    // TODO - replace with something better
    if (++tickCounter >= 100) {
      tickCounter = 0;
      console.log("Saving...")
      saveToStorage(game);
    }

  }, TICK_RATE);

  return () => {
    if (intervalId !== null) {
      clearIntervalFix(intervalId);
      intervalId = null;
    }
  };
}
