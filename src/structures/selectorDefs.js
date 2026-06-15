
// TODO actually implement this
export const sel = {
  /** All active conditions that carry the given tag. */
  // TODO - set effect.condition for every result?
  conditionsByTag: (tag) => (game, ctx) =>
    Object.keys(game.activeConditions).filter((id) =>
    ctx.CONDITIONS[id]?. tags?. includes(tag)
  ),
};