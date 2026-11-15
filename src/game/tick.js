import { initialiseWorld } from "../utils/state_creator.js";
import { spawnActor } from "./actor.js";
import { setIntervalFix, clearIntervalFix } from "../utils/throttleFix.js";
import { processTrigger } from "./events.js";
import { hasStoredSave, loadFromStorage, saveToStorage } from "../utils/save.js";
import { initUI, changeUIActor } from "../ui/panelManager.js";
import { PANELS } from "../data/panelsData.js";


const TICK_RATE = 1000 / 10;

let tickCounter = 0;
let intervalId = null;

export function startTicking() {
  const world = initialiseWorld();

  if (hasStoredSave()) {
    loadFromStorage(world); // populates world.actors and other fields
  }

  // TODO - ensure actor id collision doesnt happen
  // player data getting overwritten by a football-themed mod wouldnt be ideal lmao
  let protagonist = world.actors.get(world.protagonist);

  if (!protagonist) {
    // TODO - define default protag in config file not engine
    protagonist = spawnActor(world, { defId: "player", team: "good" });  // Look, its you!
  }

  window.world = world;

  initUI(PANELS);
  changeUIActor(protagonist);

  if (intervalId !== null) clearIntervalFix(intervalId);
  intervalId = setIntervalFix(() => {
    for (const actor of [...world.actors.values()]) {
      try {
        processTrigger(actor, "tick", {}, "pre");
        processTrigger(actor, "tick", {}, "post");
      }
      catch {
        console.error(`tick failed for actor "${actor.id}":`, err);
        // TODO - smite failing actor with tribulation lightning. 9999 damage.
      }
    }

    autoSave(world);

  }, TICK_RATE);

  return () => {
    if (intervalId !== null) {
      clearIntervalFix(intervalId);
      intervalId = null;
    }
  };
}

// TODO - replace with something better
function autoSave(world) {
  if (++tickCounter >= 100) {
    tickCounter = 0;
    console.log("Saving...")
    saveToStorage(world);
  }
}