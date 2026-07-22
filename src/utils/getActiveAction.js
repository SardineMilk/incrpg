
// TODO - remove this
export function getActiveAction(game) {
  for (const id of game.registry.view("ActiveHolder", "CompletionHolder")) {
    if (game.activation.active.has(id)) return id;
  }
  return null;
}