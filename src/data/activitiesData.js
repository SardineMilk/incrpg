import { eff, req } from "./structure.js";

// Activities should mostly replace actions as the default way the player interacts with the world
//

export const ACTIVITIES = {
    explore_woods: {
        duration: 100,
        requirements: [],
        tick: [],
        result: [],
        tags: ["traversal"],
        adversary_actions: {        
            "root_trip":1, 
            "mud_puddle":1, 
            "thorn_bush":0.5, 
            "wind_gust":0.25,
            "spot_trail": 0.25,
            "ignore_wisps": 0.25,
        },
    }
},