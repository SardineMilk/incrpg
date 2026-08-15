import { resolveEffect, diffEffect, applyResolved, removeEffect } from "../game/effects.js";

const SINGLETON_KEY = Symbol("singleton-target");
const getInstanceKey = (resolved) => resolved.id ?? SINGLETON_KEY;


export class PersistentEffect {
  constructor(raw) {
    this.raw = raw;
    this.instances = new Map();
    this.sub = null;
    this._game = null;
    this._strength = 1;
    this._active = false;
  }

  get isActive() { return this._active; }

  activate(game, strength = 1) {
    if (this._active) return;
    this._active = true;
    this._game = game;
    this._strength = strength;
    this._reconcile(/* apply */ true);
  }

  // Track all dependencies without actually applying anything
  // This is used on load - state already contains the changes
  prime(game, strength = 1) {
    if (this._active) return;
    this._active = true;
    this._game = game;
    this._strength = strength;
    this._reconcile(/* apply */ false);
  }

  deactivate() {
    if (!this._active) return;
    const game = this._game;
    if (this.sub) { game.reactor.unsubscribe(this.sub); this.sub = null; }
    this._reconcileInstances([], true);
    this._active = false;
    this._game = null;
  }

  setStrength(strength) {
    if (!this._active) return;
    this._strength = strength;
    this._reconcile(true);
  }

  _reconcile(apply) {
    const game = this._game;
    const { result: resolvedList, deps } = game.reactor.track(() =>
      resolveEffect(game, this.raw, this._strength));

    if (this.sub) {
      game.reactor.resubscribe(this.sub, deps);
    } else if (deps.size > 0) {
      this.sub = game.reactor.subscribe(deps, () => this._reconcile(true));
    }

    this._reconcileInstances(resolvedList, apply);
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
      removeEffect(this._game, previous);
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
    }
  }

}