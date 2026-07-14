export const CHECK_DEFS = {
  skillCheck: {
    create: (skills, difficulty) => ({ type: "skillCheck", skills, difficulty }),
    resolve(game, c) {
      const power = Object.entries(c.skills).reduce(
        (sum, [skill, weight]) =>
          sum + (game.registry.get(skill, "LevelHolder")?.level ?? 0) * weight,
        0
      );
      // Placeholder balancing: skill power vs a difficulty-scaled roll.
      const roll = Math.random() * c.difficulty * 2;
      return power + roll >= c.difficulty;
    },
  },

  always: {
    create: () => ({ type: "always" }),
    resolve: () => true,
  },
};

export const chk = Object.fromEntries(
  Object.entries(CHECK_DEFS).map(([name, def]) => [name, def.create])
);

export function resolveCheck(game, check) {
  const def = CHECK_DEFS[check.type];
  return def.resolve(game, check);
}