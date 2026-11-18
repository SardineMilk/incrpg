import { ATTRIBUTES } from "./attributes.js";
import { RECOVERY } from "./recovery.js";
import { COMBAT } from "./combat.js";
import { RESTING } from "./resting.js";
import { TRAINING } from "./training.js";
import { TRAVERSAL } from "./traversal.js";
import { SUBTERFUGE } from "./subterfuge.js";
import { SURVIVAL } from "./survival.js";
import { LABOUR } from "./labour.js";
import { CRAFTING } from "./crafting.js";
import { KNOWLEDGE } from "./knowledge.js";
import { SOCIAL } from "./social.js";

export const SKILLS = Object.assign({}, ATTRIBUTES, RECOVERY, COMBAT, RESTING, TRAINING, TRAVERSAL, SUBTERFUGE, SURVIVAL, LABOUR, CRAFTING, KNOWLEDGE, SOCIAL);

  /*
  * Skill tree layout (top-level nodes only - see individual entries for children)
  *
  * Combat      - weapon_proficiency, ranged, unarmed, evasion
  * Resting     - meditation, sleeping
  * Training    - exercise, sparring
  * Traversal   - running, walking, climbing, swimming, parkour, acrobatics
  * Subterfuge  - sneaking, lockpicking, pickpocketing, ambushing
  * Survival    - tracking, navigation, trapping, riding, mountaineering
  * Labour      - hauling, knot_tying, gathering (-> woodcutting/harvesting/mining/fishing/hunting)
  * Crafting    - carpentry, smithing, cooking, stoneworking, engraving, jewelry_making,
  *               leatherworking, alchemy
  * Knowledge   - observation, anatomy, occultism, strategy, appraising
  * Social      - persuasion, negotiation, intimidation, storytelling
  *
  * Every parent node levels up from its children's xp
  */

/*
Skill Ideas - deferred (not final)

- Aikido / Bodybuilding / Aerobics / Calisthenics / Athletics
- Stealthing / Foraging / Blacksmithing / Metalworking / Stone Masonry / Horseback Riding
- Taming / Scavenging / Bird Watching
- Literacy / Reading / Writing / Astronomy / Teaching
- Geology
- Bartering / Sarcasm / Ventriloquism
- Drinking / Gambling / Painting / Weaving / Sewing / Taxidermy / Caber Tossing
*/
