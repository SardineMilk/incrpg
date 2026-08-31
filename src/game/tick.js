import { INHERENT_EFFECTS } from "../data/conditionsData.js";
import { initialiseWorld } from "../utils/state_creator.js";
import { spawnActor } from "./actor.js";
import { EventLog } from "./log.js";
import { setIntervalFix, clearIntervalFix } from "../utils/throttleFix.js";
import { processTrigger } from "./events.js";
import { applyEffect } from "./effects.js";
import { hasStoredSave, loadFromStorage, saveToStorage } from "../utils/save.js";
import { initUI } from "../ui/panelManager.js";
import { renderLog } from "../ui/renderLog.js";


const TICK_RATE = 1000 / 10;

let tickCounter = 0;
let intervalId = null;

export function startTicking() {
  const world = initialiseWorld();

  if (hasStoredSave()) {
    loadFromStorage(world); // populates world.actors
  }

  // TODO - ensure actor id collision doesnt happen
  // player data getting overwritten by a football-themed mod wouldnt be ideal lmao
  let player = world.actors.get("player");

  const isNewGame = !player;
  if (isNewGame) {
    player = spawnActor(world, { id: "player", team: "good" });  // Look, its you!
  }

  // TODO - move to world creation
  world.log = new EventLog({ container: document.getElementById("log-box") });
  world.log.container.scrollTop = world.log.container.scrollHeight;
  world.log.followTail = true;


  window.world = world;

  // Literally the only place where player is special-cased
  initUI(world, player);

  if (intervalId !== null) clearIntervalFix(intervalId);
  intervalId = setIntervalFix(() => {
    for (const actor of world.actors.values()) {
      processTrigger(actor, "tick", {}, "pre");
      processTrigger(actor, "tick", {}, "post");
    }
    renderLog(world);

    // TODO - replace with something better
    if (++tickCounter >= 100) {
      tickCounter = 0;
      console.log("Saving...")
      saveToStorage(world);
    }

  }, TICK_RATE);

  return () => {
    if (intervalId !== null) {
      clearIntervalFix(intervalId);
      intervalId = null;
    }
  };
}