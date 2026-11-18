// important, do not delete
export function check(game, requirement) {
  return !requirement || !!requirement(game);
}
