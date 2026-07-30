import {eff, req, evt, sel, fml } from "../structures/structures.js";

// Activities should mostly replace actions as the default way the player interacts with the world
//

export const ACTIVITIES = {
    explore_woods: {
        duration: 100,
        requirements: [],
        tick: [],
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
        tick: [],
        result: [],
        tags: ["gathering"],
        allowed: ["combat"],
        adversaries: [
            
        ],
    },
}