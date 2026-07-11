// Anything that needs "apply a list of effects, track what was applied,
// undo it later, optionally scaled by strength" can own one of these —
// actions, conditions, and (later) items, quests, equipped gear, etc.

import { applyEffect, removeEffect } from "../game/effects.js";

export class EffectHolder {
  constructor(effectDefs = []) {
    this.effectDefs = effectDefs;  // Static eff.* definitions, never mutated
    this.appliedEffects = []; // resolved effect objects, needed to undo later
  }

  static type = "EffectHolder"
  static fromDefinition(def) {
    return new EffectHolder(def.effects ?? []);
  }

  get isApplied() {
    return this.appliedEffects.length > 0;
  }

  // Apply every effectDef against `game`, optionally scaled by `strength`
  apply(game, strength = 1) {
    if (!this.effectDefs.length) return;
    if (this.isApplied) {
      console.warn("EffectHolder.apply() called while already applied — call remove() first");
      return;
    }

    const applied = [];
    for (const effect of this.effectDefs) {
      applied.push(...applyEffect(game, effect, strength));
    }
    this.appliedEffects = applied;
  }

  remove(game) {
    if (!this.appliedEffects.length) return;
    // Reverse order so stacked effects remove correctly
    // Probably not required, but it'd be horrid to debug if it failed
    for (let i = this.appliedEffects.length - 1; i >= 0; i--) {
      removeEffect(game, this.appliedEffects[i]);
    }
    this.appliedEffects = [];
  }

  reapply(game, strength = 1) {
    // Remove the static resolved effects
    // Reapply them using the current strength
    this.remove(game);
    this.apply(game, strength);
  }
}