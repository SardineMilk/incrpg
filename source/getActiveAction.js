import { game } from "../game/state.js";

export function getActiveAction() {
  for (const id of game.registry.view("ActiveHolder", "CompletionHolder")) {
    if (game.registry.get(id, "ActiveHolder").active) return id;
  }
  return null;
}