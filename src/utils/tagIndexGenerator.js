import { tagIndexGenerator } from "./tagIndex.js";
import { CONDITIONS } from "../data/conditionsData.js";
import { SKILLS } from "../data/skillsData.js";
import { LOCATIONS } from "../data/locationsData.js";

tagIndexGenerator("conditions", CONDITIONS);
tagIndexGenerator("skills", SKILLS);
tagIndexGenerator("locations", LOCATIONS);