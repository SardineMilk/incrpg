import { renderHero } from "./renderHero.js";
import { renderLog } from "./renderLog.js";
import { renderActions } from "./renderActions.js";
import { renderSkills } from "../ui/renderSkills.js";

export function render(game) {
  renderHero(game);
  renderLog(game);
  renderActions(game);
  renderSkills(game);
}
