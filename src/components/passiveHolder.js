import { PersistentEffect } from "./persistentEffect.js";
import { meetsRequirements } from "../game/requirements.js";

// TODO - this should be in state_creator
function normalize(passiveDefs) {
  return passiveDefs.map((p) =>
    p && Array.isArray(p.effects)
      ? { requirements: p.requirements ?? [], effects: p.effects }
      : { requirements: [], effects: [p] }
  );
}

export class PassiveHolder {
  constructor(passiveDefs = []) {
    this.groups = normalize(passiveDefs);
    this._groupEffects = this.groups.map((g) => g.effects.map((raw) => new PersistentEffect(raw)));
    this._presenceSubs = this.groups.map(() => null);
    this._presenceBusy = this.groups.map(() => false);
    this._strength = 1;
    this._game = null;
    this._priming = false;
    this._applied = false;
  }

  static fromDefinition(def) { return new PassiveHolder(def.passives ?? []); }
  get isApplied() { return this._applied; }

  apply(game, strength = 1) { this._start(game, strength, false); }
  prime(game, strength = 1) { this._start(game, strength, true); }

  _start(game, strength, priming) {
    if (this._applied) {
      console.warn("PassiveHolder.apply()/prime() called while already applied — call remove() first");
      return;
    }
    this._applied = true;
    this._game = game;
    this._strength = strength;
    this._priming = priming;
    for (let i = 0; i < this.groups.length; i++) this._reconcilePresence(i);
  }

  remove(game) {
    if (!this._applied) return;
    for (let i = 0; i < this.groups.length; i++) {
      this._deactivateGroup(i);
      const sub = this._presenceSubs[i];
      if (sub) { game.reactor.unsubscribe(sub); this._presenceSubs[i] = null; }
    }
    this._applied = false;
    this._game = null;
  }

  reapply(game, strength = 1) {
    if (!this._applied) return;
    this._strength = strength;
    for (const effects of this._groupEffects) for (const pe of effects) pe.setStrength(strength);
  }

  _reconcilePresence(groupIndex) {
    if (this._presenceBusy[groupIndex]) return;
    this._presenceBusy[groupIndex] = true;
    try {
      const game = this._game;
      const group = this.groups[groupIndex];
      const { result: shouldBeActive, deps } = game.reactor.track(() => meetsRequirements(game, group));
      this._updateSubscription(this._presenceSubs, groupIndex, deps, () => this._reconcilePresence(groupIndex));

      const isActive = this._groupEffects[groupIndex][0]?.isActive ?? false;
      if (shouldBeActive && !isActive) this._activateGroup(groupIndex);
      else if (!shouldBeActive && isActive) this._deactivateGroup(groupIndex);
    } finally {
      this._presenceBusy[groupIndex] = false;
    }
  }

  _activateGroup(groupIndex) {
    for (const pe of this._groupEffects[groupIndex]) {
      if (this._priming) pe.prime(this._game, this._strength);
      else pe.activate(this._game, this._strength);
    }
  }

  _deactivateGroup(groupIndex) {
    for (const pe of this._groupEffects[groupIndex]) pe.deactivate();
  }

  _updateSubscription(subscriptions, index, deps, callback) {
    const game = this._game;
    const existing = subscriptions[index];
    if (existing) game.reactor.resubscribe(existing, deps);
    else if (deps.size > 0) subscriptions[index] = game.reactor.subscribe(deps, callback);
  }
}