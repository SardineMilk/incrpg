import { resolveEffect, diffEffect, applyResolved, removeEffect, isReversible } from "../game/effects.js";
import { meetsRequirements } from "../game/requirements.js";

const SINGLETON_KEY = Symbol("singleton-target");
const getInstanceKey = (resolved) => resolved.id ?? SINGLETON_KEY;

// TODO - this is a bloated mess, it needs a rewrite
export class PersistentEffect {
  constructor(raw, requirements = []) {
    this.raw = raw;
    this.requirements = requirements;

    this.instances = new Map();
    this._effectSub = null;
    this._presenceSub = null;

    this._game = null;
    this._strength = 1;
    this._present = false;
    this._active = false;
  }

  get isActive() { return this._active; }
  get isPresent() { return this._present; }

  getState() { return [...this.instances.values()]; }
  setState(saved) {
    this.instances = new Map(saved.map(r => [getInstanceKey(r), r]));
  }

  activate(game, strength = 1) { this._start(game, strength, true); }
  prime(game, strength = 1) { this._start(game, strength, false); }

  _start(game, strength, apply) {
    if (this._active) return;
    this._active = true;
    this._game = game;
    this._strength = strength;
    this._reconcilePresence(apply);
  }

  deactivate() {
    if (!this._active) return;
    const game = this._game;
    this._teardownEffect();
    if (this._presenceSub) { game.reactor.unsubscribe(this._presenceSub); this._presenceSub = null; }
    this._active = false;
    this._present = false;
    this._game = null;
  }

  setStrength(strength) {
    if (!this._active) return;
    this._strength = strength;
    if (this._present) this._reconcileEffect(true);
  }

  _reconcilePresence(apply = true) {
    const game = this._game;
    const { result: shouldBePresent, deps } = game.reactor.track(() =>
      meetsRequirements(game, { requirements: this.requirements }));

    if (this._presenceSub) game.reactor.resubscribe(this._presenceSub, deps);
    else if (deps.size > 0) this._presenceSub = game.reactor.subscribe(deps, () => this._reconcilePresence());

    if (shouldBePresent && !this._present) {
      this._present = true;
      this._reconcileEffect(apply);
    } else if (!shouldBePresent && this._present) {
      this._present = false;
      this._teardownEffect();
    }
  }

  _reconcileEffect(apply = true) {
    const game = this._game;
    const { result: resolvedList, deps } = game.reactor.track(() =>
      resolveEffect(game, this.raw, this._strength));

    if (this._effectSub) game.reactor.resubscribe(this._effectSub, deps);
    else if (deps.size > 0) this._effectSub = game.reactor.subscribe(deps, () => this._reconcileEffect(true));

    if (apply || this.instances.size === 0) {
      this._reconcileInstances(resolvedList, apply);
    }
  }

  _teardownEffect() {
    if (this._effectSub) { this._game.reactor.unsubscribe(this._effectSub); this._effectSub = null; }
    this._reconcileInstances([], true);
  }

  _reconcileInstances(resolvedList, apply) {
    const seen = new Set();
    for (const resolved of resolvedList) {
      const key = getInstanceKey(resolved);
      seen.add(key);
      this._reconcileInstance(key, resolved, apply);
    }
    for (const [key, previous] of [...this.instances]) {
      if (seen.has(key)) continue;
      this.instances.delete(key);
      this._remove(previous);
    }
  }

  _reconcileInstance(key, next, apply) {
    const previous = this.instances.get(key);
    if (!previous) {
      this.instances.set(key, next);
      if (apply) applyResolved(this._game, next);
      return;
    }
    const delta = diffEffect(previous, next);
    this.instances.set(key, next);
    if (delta) {
      if (apply) applyResolved(this._game, delta);
    } else {
      // Fallback
      removeEffect(this._game, previous);
      applyResolved(this._game, next);
    }
  }

  _remove(resolved) {
    removeEffect(this._game, resolved);
  }
}