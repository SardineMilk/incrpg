import {eff, req, evt, sel, fml } from "../structures/structures.js";

// Activities should mostly replace actions as the default way the player interacts with the world
//

// TODO - actually design how this should look
/*
* Should the adversary plug into the activity
* - this would make combat easier
* - duration would be removed, actions would progress against the adversary
*   - specific forest has a distance stat
*     - traversal actions deal "distance" damage
*   - this would be extended for everything else
*       - integrity of rock, suspicion of guards, etc
*   - may require a second data layer:
*       - adversaries - meldrum woods
*       - activity frameworks - explore woods
*       - combinations - explore meldrum woods
*       - could this be done with a pseudo dependency injection system? 
* Activities should be able to trigger sub-activities
*   - exploring woods can lead to fighting a monster
*   - fairly simple description in data: 
*       - encounter_goblin adversary action has the effect of starting goblin fight activity
*   - how should this be described in code?
*       - activity stack? tree?
*
*/
export const ACTIVITIES = {
    explore_woods: {
        duration: 100,
        requirements: [],
        result: [],
        tags: ["exploration"],
        allowed: ["traversal"],
        adversary_actions: {        
            root_trip:   { weight: 1, },
            mud_puddle:  { weight: 1, },
            thorn_bush:  { weight: 0.5, },
            wind_gust:   { weight: 0.25, },
            spot_trail:  { weight:  0.25, },
            ignore_wisps:{ weight:  0.25, },
        },
    },

    chop_tree: {
        requirements: [],
        result: [],
        tags: ["gathering"],
        allowed: ["combat"],
        adversaries: [
            "oak_tree"
        ],
    },
}