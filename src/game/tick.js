import { INHERENT_EFFECTS }                     from "../data/conditionsData.js";
import { initialiseWorld, createActor }         from "../utils/state_creator.js";
import { EventLog }                             from "./log.js";
import { setIntervalFix, clearIntervalFix }     from "../utils/throttleFix.js";
import { processTrigger }                       from "./events.js";
import { applyEffect }                          from "./effects.js";
import { hasStoredSave, loadFromStorage, saveToStorage } from "../utils/save.js";
import { initUI } from "../ui/panelManager.js";
import { renderLog } from "../ui/renderLog.js";

const TICK_RATE = 1000 / 10;

let tickCounter = 0;
let intervalId = null;

export function startTicking() {
  const world = initialiseWorld();

  let player = loadFromStorage(world);
  const isNewGame = !player;
  if (isNewGame) {
    player = createActor(world, { id: "player", team: "player" });
  }

  // TODO - move to world creation
  world.log = new EventLog({ container: document.getElementById("log-box") });
  world.log.container.scrollTop = world.log.container.scrollHeight;
  world.log.followTail = true;

  if (isNewGame) applyEffect(player, { type: "activate", id: "startup" });

  window.world = world;

  // Can something fun be done with this?
  initUI(world, player);

  if (intervalId !== null) clearIntervalFix(intervalId);
  intervalId = setIntervalFix(() => {
    // Separate tick() events per actor
    // TODO - ordering of world actors for tick priority in combat etc
    for (const actor of world.actors.values()) {
      processTrigger(actor, "tick", {}, "pre");
      processTrigger(actor, "tick", {}, "post");
    }
    renderLog(world);

    // TODO - replace with something better
    if (++tickCounter >= 100) {
      tickCounter = 0;
      console.log("Saving...")
      saveToStorage(world, player);
    }

  }, TICK_RATE);

  return () => {
    if (intervalId !== null) {
      clearIntervalFix(intervalId);
      intervalId = null;
    }
  };
}