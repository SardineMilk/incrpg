import {eff, req, evt, sel, fml } from "../structures/structures.js";

// Activities should mostly replace actions as the default way the player interacts with the world
//

// TODO - actually design how this should look
/*
* Should the adversary plug into the activity
* - this would make combat easier
* - duration would be removed, actions would progress against the adversary
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
    fall_asleep: {
        // While "relaxation">=50, apply "asleep" condition
        // This might require effect objects with requirements, like triggers?
        meters: {
            relaxation: {
                repeat: false,
                max: 100,
            }
        },
    },


    explore_meldrum_woods: {
        name: "Explore New Meldrum Woods",
        requirements: [],
        tags: ["exploration"],
        allowed: ["traversal"],
        meters: {
            distance: {
                max: 1000,
                result: [],
            },
        },
        actions: {
            root_trip:   { weight: 1, },
            mud_puddle:  { weight: 1, },
            thorn_bush:  { weight: 0.5, },
            wind_gust:   { weight: 0.25, },
            spot_trail:  { weight:  0.25, },
            ignore_wisps:{ weight:  0.25, },
        },
    },

    // TODO - proper resetting of meters upon deactivation 
    climb_northern_cliff: {
        name: "Northern Cliff",
        tags: ["exploration"],
        allowed: ["vertical_traversal"],
        requirements: [],
        effects: [],
        triggers: [
            // If you are at the bottom of the cliff, gain 1 grip per tick
            {
                event: evt.tick(),
                requirements: [req.eq(fml.progress("climb_northern_cliff", "height"), 0)],
                effects: [eff.progress("climb_northern_cliff", 1, "grip")]
            },
            // While climbing, lose 1 grip per tick
            {
                event: evt.tick(),
                requirements: [req.gt(fml.progress("climb_northern_cliff", "height"), 0)],
                effects: [eff.progress("climb_northern_cliff", -1, "grip")]
            },
        ],

        meters: {
            height: {
                max: 200,
                result: [
                    eff.sendMessage("SYSTEM", "You reach the top of the cliff"),
                    eff.deactivate("climb_northern_cliff"),
                    eff.activate("test_cliff_top")
                ],
            },
            grip: {
                start: 100,
                repeat: false,
                max: 100,
                min: 0,
                onMin: [
                    eff.sendMessage("SYSTEM", "You lose your grip and fall off the cliff face"),
                    eff.changeValue("health", fml.neg(fml.progress("climb_northern_cliff", "height"))),
                    eff.setMeter("climb_northern_cliff", 0, "height"),
                ],
            },
        },
        actions: {
            wind_gust:       { weight: 1, },
            falling_rocks:   { weight: 0.5, },
            falling_boulder: { weight: 0.5, },
        }
    },

    chop_tree: {
        name: "Oak Tree",
        requirements: [],
        tags: ["gathering"],
        allowed: ["combat"],
        meters: {
            health: {
                max: 500,
                min: 0,
                onMin: [],
            }
        },
    },


}