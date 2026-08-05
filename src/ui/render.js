import { renderHero } from "./renderHero.js";
import { renderLog } from "./renderLog.js";
import { renderActions } from "./renderActions.js";
import { renderActivity } from "./renderActivity.js"
import { renderSkills } from "./renderSkills.js";

/*
* Plan
*
* Top Left
* - Name/attributes/resources/location
* Bottom Left
* - List of active effects (filterable)
* Top Centre
* - Current activity
* Bottom Centre
* - If no activity: select activity
* - If activity: available actions
* Bottom Right
* - skills
* Far Right
* - Log box 
*
*/


export function render(game) {
  renderHero(game);
  renderLog(game);
  renderActions(game);
  renderActivity(game);
  renderSkills(game);
}
