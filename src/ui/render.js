import { renderHero } from "./renderHero.js";
import { renderLog } from "./renderLog.js";
import { renderActions } from "./renderActions.js";
import { renderActivity } from "./renderActivity.js"
import { renderSkills } from "./renderSkills.js";

export function render(game) {
  renderHero(game);
  renderLog(game);
  renderActions(game);
  renderActivity(game);
  renderSkills(game);
}
