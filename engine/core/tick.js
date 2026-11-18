import { initialiseWorld } from "../world/state_creator.js";
import { spawnActor } from "../world/actor.js";
import { setIntervalFix, clearIntervalFix } from "../util/throttleFix.js";
import { hasStoredSave, loadFromStorage, saveToStorage } from "../world/save.js";
import { initUI, changeUIActor } from "../ui/panelManager.js";
import { PANELS } from "../loader/registry.js";
import { loadMods } from "../loader/loader.js";


const TICK_RATE = 1000 / 10;

let tickCounter = 0;
let intervalId = null;

export async function startTicking() {
  await loadMods();
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
        actor.events.emit("tick", {}, "pre");
        actor.events.emit("tick", {}, "post");
      }
      catch (err){
        console.error(`tick failed for actor "${actor.id}":`, err);
        actor.events.emit("error", {err}, "post");
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