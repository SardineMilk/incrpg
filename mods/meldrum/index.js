import { defineMod } from "../../api/index.js";
import { ENEMY_ACTIONS } from "./bestiary/actions.js";
import { FORMS } from "./bestiary/forms.js";
import { PLAYER_CONDITIONS } from "./conditions.js";
import { ACTIVITIES } from "./activities.js";
import { LOCATIONS } from "./locations.js";
import { ACTORS } from "./actors.js";

export default defineMod({
  actions: ENEMY_ACTIONS,
  activities: ACTIVITIES,
  conditions: { ...FORMS, ...PLAYER_CONDITIONS },
  locations: LOCATIONS,
  actors: ACTORS,
});
