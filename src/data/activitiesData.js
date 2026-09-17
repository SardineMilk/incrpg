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


    climb_northern_cliff: {
        name: "Climb Northern Cliff",
        tags: ["exploration", "vertical_traversal"],
        requirements: fml.or(fml.active("new_meldrum"), fml.active("northern_cliff_top")),

        triggers: [
            {
                event: evt.onActivate("climb_northern_cliff"),
                effects: [
                    eff.resetMeter("climb_northern_cliff",
                        fml.ternary(fml.active("northern_cliff_top"), 200, 0), "height"),
                    eff.resetMeter("climb_northern_cliff", 100, "grip"),
                ],
            },
        ],
        meters: {
            height: {
                max: 200,
                min: 0,
                repeat: false,
                result: [
                    eff.sendMessage("SYSTEM", "You reach the top of the cliff"),
                    eff.deactivate("climb_northern_cliff"),
                    eff.activate("northern_cliff_top"),
                ],
                onMin: [
                    eff.sendMessage("SYSTEM", "You reach the bottom of the cliff"),
                    eff.deactivate("climb_northern_cliff"),
                    eff.activate("new_meldrum"),
                ],
            },
            // Depletes while climbing, regenerates on it's own
            // Losing grip makes you fall to the bottom, losing health
            grip: {
                start: 100,
                max: 100,
                min: 0,
                repeat: false,
                onMin: [
                    eff.sendMessage("SYSTEM", "Your grip gives out and you land at the bottom of the cliff"),
                    // Damage scales with how far you'd fallen
                    eff.changeValue(
                        "health",
                        fml.mul(fml.progress("climb_northern_cliff", "height"), -0.15),
                    ),
                    eff.setMeter("climb_northern_cliff", 0, "height"),
                    eff.resetMeter("climb_northern_cliff", 100, "grip"),
                ],
            },
        },
        actions: {
            wind_gust:       { weight: 1, },
            falling_rocks:   { weight: 0.5, },
            falling_boulder: { weight: 0.5, },
        },
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