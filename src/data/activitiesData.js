import {eff, evt, sel, fml } from "../structures/structures.js";

export const ACTIVITIES = {
    fall_asleep: {
        name: "Try to fall asleep",
        tags: ["rest"],
        meters: {
            relaxation: {
                repeat: false,
                max: 100,
            }
        },
        passives: [
            {
                requirements: fml.geq(fml.progress("fall_asleep", "relaxation"), 50),
                effects: [
                    eff.activate("asleep"), 
                    eff.uiStyle("#hero-panel", { backgroundColor:"black", })
                ],
            }
        ],   
    },


    explore_meldrum_woods: {
        name: "Explore New Meldrum Woods",
        tags: ["exploration", "traversal"],
        meters: {
            distance: {
                max: 1000,
                result: [
                    eff.sendMessage("SYSTEM", "You reach the centre of the forest"),
                    eff.deactivate("explore_meldrum_woods")
                ],
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

    // TODO - should these be condensed into one activity?
    // Maybe requirements for leaving activity, with different effects depending on height meter?
    // The starting height would nee

    // TODO - proper resetting of meters upon deactivation 
    climb_northern_cliff: {
        name: "Climb Northern Cliff",
        tags: ["exploration", "vertical_traversal"],
        requirements: fml.active("new_meldrum"),
        passives: [],

        meters: {
            height: {
                max: 200,
                repeat: false,
                result: [
                    eff.sendMessage("SYSTEM", "You reach the top of the cliff"),
                    eff.deactivate("climb_northern_cliff"),
                    eff.activate("northern_cliff_top")
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
                    eff.setMeter("climb_northern_cliff", 100, "grip"),
                ],
            },
        },
        actions: {
            wind_gust:       { weight: 1, },
            falling_rocks:   { weight: 0.5, },
            falling_boulder: { weight: 0.5, },
        }
    },

    descend_northern_cliff: {
        name: "Descend Northern Cliff",
        tags: ["exploration", "vertical_traversal"],
        requirements: fml.active("northern_cliff_top"),
        passives: [],

        meters: {
            height: {
                start: 200,
                max: 200,
                repeat: false,
                onMin: [
                    eff.sendMessage("SYSTEM", "You reach the bottom of the cliff"),
                    eff.deactivate("descend_northern_cliff"),
                    eff.activate("new_meldrum")
                ],
            },
            grip: {
                start: 100,
                repeat: false,
                max: 100,
                min: 0,
                onMin: [
                    eff.sendMessage("SYSTEM", "You lose your grip and fall off the cliff face"),
                    eff.changeValue("health", fml.neg(fml.progress("descend_northern_cliff", "height"))),
                    eff.setMeter("descend_northern_cliff", 0, "height"),
                    eff.setMeter("descend_northern_cliff", 100, "grip"),
                    eff.activate("new_meldrum")
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
        name: "Chop Oak Tree",
        tags: ["gathering"],
        allowed: ["combat"],
        meters: {
            health: {
                start: 100,
                max: 500,
                min: 0,
                onMin: [],
            }
        },
    },


}
