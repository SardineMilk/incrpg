import {
  resolveEffect,
  applyResolved,
  removeEffect,
  diffEffect,
  isReversible,
} from "../game/effects.js";
import { meetsRequirements } from "../game/requirements.js";

const SINGLETON_KEY = Symbol("singleton-target");

function normalize(passiveDefs) {
  return passiveDefs.map((passive) =>
    passive && Array.isArray(passive.effects)
      ? {
          requirements: passive.requirements ?? [],
          effects: passive.effects,
        }
      : {
          requirements: [],
          effects: [passive],
        },
  );
}

function getInstanceKey(resolved) {
  return resolved.id ?? SINGLETON_KEY;
}

function reconcileInstance(game, instances, key, next) {
  const previous = instances.get(key);

  if (!previous) {
    instances.set(key, next);
    applyResolved(game, next);
    return;
  }

  const delta = diffEffect(previous, next);

  if (delta) {
    instances.set(key, next);
    applyResolved(game, delta);
  } else if (delta === undefined) {
    console.warn("PassiveHolder effect has no eff.diff() defined");
    instances.delete(key);
    if (isReversible(previous.type)) removeEffect(game, previous);
    instances.set(key, next);
    applyResolved(game, next);
  } else {
    instances.set(key, next);
  }
}

// TODO - check if modifying causes drift
function reconcileInstances(game, instances, resolvedList) {
  const seen = new Set();

  for (const resolved of resolvedList) {
    const key = getInstanceKey(resolved);
    seen.add(key);
    reconcileInstance(game, instances, key, resolved);
  }

  for (const [key, previousResolved] of [...instances]) {
    if (seen.has(key)) continue;
    instances.delete(key);
    if (isReversible(previousResolved.type)) {
      removeEffect(game, previousResolved);
    }
  }

  return instances;
}

export class PassiveHolder {
  constructor(passiveDefs = []) {
    this.groups = normalize(passiveDefs);

    // [{ raw, instances, sub }] for each group.
    this._entries = this.groups.map(() => []);
    this._presenceSubs = this.groups.map(() => null);

    this._presenceBusy = this.groups.map(() => false);

    this._strength = 1;
    this._game = null;
    this._applied = false;
  }

  static fromDefinition(definition) {
    return new PassiveHolder(definition.passives ?? []);
  }

  get isApplied() {
    return this._applied;
  }

  apply(game, strength = 1) {
    if (this._applied) {
      console.warn("PassiveHolder.apply() called while already applied — call remove() first");
      return;
    }

    this._applied = true;
    this._game = game;
    this._strength = strength;

    for (let i = 0; i < this.groups.length; i++) {
      this._reconcilePresence(i);
    }
  }

  remove(game) {
    if (!this._applied) return;

    for (let i = 0; i < this.groups.length; i++) {
      this._deactivateGroup(i);

      const sub = this._presenceSubs[i];
      if (sub) {
        game.reactor.unsubscribe(sub);
        this._presenceSubs[i] = null;
      }
    }

    this._applied = false;
    this._game = null;
  }

  reapply(game, strength = 1) {
    if (!this._applied) return;

    this._strength = strength;

    for (const entries of this._entries) {
      for (const entry of entries) {
        this._reconcileRawEffect(entry);
      }
    }
  }

  _reconcilePresence(groupIndex) {
    if (this._presenceBusy[groupIndex]) return;
    this._presenceBusy[groupIndex] = true;

    try {
      const game = this._game;
      const group = this.groups[groupIndex];

      const { result: shouldBeActive, deps } = game.reactor.track(() =>
        meetsRequirements(game, group),
      );


      this._updateSubscription(
        this._presenceSubs,
        groupIndex,
        deps,
        () => this._reconcilePresence(groupIndex),
      );

      const isActive = this._entries[groupIndex].length > 0;

      if (shouldBeActive && !isActive) {
        this._activateGroup(groupIndex);
      } else if (!shouldBeActive && isActive) {
        this._deactivateGroup(groupIndex);
      }
    } finally {
      this._presenceBusy[groupIndex] = false;
    }
  }

  _activateGroup(groupIndex) {
    this._entries[groupIndex] = this.groups[groupIndex].effects.map((raw) => {
      const entry = {
        raw,
        instances: new Map(),
        sub: null,
      };

      this._reconcileRawEffect(entry);
      return entry;
    });
  }

  _deactivateGroup(groupIndex) {
    const game = this._game;

    for (const entry of this._entries[groupIndex]) {
      if (entry.sub) {
        game.reactor.unsubscribe(entry.sub);
        entry.sub = null;
      }

      reconcileInstances(game, entry.instances, []);
    }

    this._entries[groupIndex] = [];
  }

  _reconcileRawEffect(entry) {
    const game = this._game;

    const { result: resolvedList, deps } = game.reactor.track(() =>
      resolveEffect(game, entry.raw, this._strength),
    );

    if (entry.sub) {
      game.reactor.resubscribe(entry.sub, deps);
    } else if (deps.size > 0) {
      entry.sub = game.reactor.subscribe(
        deps,
        () => this._reconcileRawEffect(entry),
      );
    }

    reconcileInstances(game, entry.instances, resolvedList);
  }

  _updateSubscription(subscriptions, index, deps, callback) {
    const game = this._game;
    const existing = subscriptions[index];

    if (existing) {
      game.reactor.resubscribe(existing, deps);
    } else if (deps.size > 0) {
      subscriptions[index] = game.reactor.subscribe(deps, callback);
    }
  }
}