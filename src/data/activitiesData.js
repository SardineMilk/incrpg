import {eff, evt, sel, fml } from "../structures/structures.js";


export const ACTIVITIES = {


    // meldrum_to_beach
    // beach_to_meldrum
    climb_sea_cliff: {
        name: "Climb Sea Cliff",
        tags: ["exploration", "vertical_traversal"],
        requirements: fml.or(fml.active("new_meldrum"), fml.active("meldrum_beach")),

        triggers: [
            {
                event: evt.onActivate("climb_sea_cliff"),
                effects: [
                    eff.resetMeter("climb_sea_cliff",
                        fml.ternary(fml.active("new_meldrum"), 200, 0), "height"),
                    eff.resetMeter("climb_sea_cliff", 100, "grip"),
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
                    eff.deactivate("climb_sea_cliff"),
                    eff.activate("new_meldrum"),
                ],
                onMin: [
                    eff.sendMessage("SYSTEM", "You reach the bottom of the cliff"),
                    eff.deactivate("climb_sea_cliff"),
                    eff.activate("meldrum_beach"),
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
                    eff.sendMessage("SYSTEM", "Your grip gives out and you fall"),
                    // Damage scales with how far you'd fallen
                    eff.changeValue(
                        "health",
                        fml.mul(fml.progress("climb_sea_cliff", "height"), -0.5),
                    ),
                    eff.setMeter("climb_sea_cliff", 0, "height"),
                    eff.resetMeter("climb_sea_cliff", 100, "grip"),
                ],
            },
        },
        actions: {
            wind_gust:       { weight: 1, },
            falling_rocks:   { weight: 0.5, },
            falling_boulder: { weight: 0.5, },
        },
    },


    fall_asleep: {
        name: "Try to fall asleep",
        tags: ["rest"],
        requirements: fml.active(sel.tags("bed")),
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
        requirements: fml.active("meldrum_woods"),
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

}