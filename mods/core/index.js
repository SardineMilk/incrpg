import { defineMod } from "../../api/index.js";
import { SKILLS } from "./skills/index.js";
import { PLAYER_ACTIONS } from "./actions.js";
import { CONDITIONS } from "./conditions.js";
import { PANELS } from "./ui/panels.js";

export default defineMod({
  skills: SKILLS,
  actions: PLAYER_ACTIONS,
  conditions: CONDITIONS,
  panels: PANELS,
});
