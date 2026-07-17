import { INHERENT_EFFECTS }         from "../data/conditionsData.js";
import { game }                                 from "./state.js";
import { initialiseState }                      from "../utils/state_creator.js";
import { EventLog }                    from "./log.js";
import { setIntervalFix, clearIntervalFix }     from "../utils/throttleFix.js";
import { processTrigger }                       from "./events.js";
import { applyEffect }                          from "./effects.js";


/* TODO
* - Elegant attribute xp system. Maybe related to skills? 
*   - Each skill gives xp in some attributes, agility+con for running, etc 
*   - Each skill has parent of attribute
* - Proper skill level/milestone effects
*   - using modified level, not base
*   - supports decreases
*/

/*
Recalculation of passive effects on formula change
I see several ways this can be implemented
1. When creating PassiveHolder, determine a "dynamic/static" bool.
   Every tick, a system condition reapplies (removes+applies) every
   active dynamic condition. 
   The exisiting reapply-on-strength-change is required by static conditions
   This loses sub-tick accuracy, but is easy to implement and performant
2. Create an event registry at runtime, where dynamic conditions 'hook' onto
   specific changes, being recalculated every time the change triggers.
   e.g. "increase maxHealth by maxMana" would hook onto evt.changeValue("maxMana")
3. Don't store values as literals. 
   Instead, store them as combinations of everything that influences them
   maxHealth = 150
   maxHealth = {human:100, manaShield:fml.value("maxMana")}
   The getter would resolve these combinations when accessing the value
   When a condition is deactivated, it simply removes it's properties from all combinations 
   This is a very elegant solution, but would it be practical? Survey says 'maybe'
I believe 1. is the most practical option to start with
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

  applyEffect(game, { type: "activateCondition", condition: "startup" });

  if (intervalId !== null) clearIntervalFix(intervalId);
  intervalId = setIntervalFix(() => {
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
