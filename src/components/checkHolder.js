import { applyEffect } from "../game/effects.js";
import { chk, resolveCheck } from "../structures/checkDefs.js";

export class CheckHolder {
  constructor(check = null, success = [], failure = []) {
    this.check = check;
    this.success = success;
    this.failure = failure;
  }

  // TODO - this is placeholder
  static fromDefinition(def) {
    if (!def.check) return new CheckHolder();
    const { skills = {}, difficulty = 0 } = def.check;
    return new CheckHolder(
      chk.skillCheck(skills, difficulty),
      def.success ?? [],
      def.failure ?? []
    );
  }

  get hasCheck() {
    return this.check !== null;
  }

  // Not reversible
  resolve(game, strength = 1) {
    if (!this.hasCheck) return null;
    const succeeded = resolveCheck(game, this.check);
    for (const effect of succeeded ? this.success : this.failure) {
      applyEffect(game, effect, strength);
    }
    return succeeded;
  }
}