import { eff, evt, sel, mod } from "../../api/index.js";

export const PLAYER_CONDITIONS = {
  plot_armor: {
    name: "Plot Armor",
    description: "Death is cancelled.",
    modifiers: [{ event: evt.despawn(), modify: [mod.cancel()] }],
    triggers: [{
      event: evt.despawn(),
      phase: "pre",
      effects: [
        eff.deactivate(sel.active(sel.tags("actions"))),
        eff.deactivate(sel.active(sel.tags("activities"))),
        eff.activate("starter_hut"),
        eff.setValue("health", 0),
        eff.sendMessage("SYSTEM", "You wake up in your hut."),
      ],
    }],
  },
};
