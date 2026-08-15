import { PersistentEffect } from "./persistentEffect.js";

// TODO - move to state_creator. Why is PassiveHolder editing the data formatting?
function normalize(passiveDefs) {
  return passiveDefs.map((p) =>
    p && Array.isArray(p.effects)
      ? { requirements: p.requirements ?? [], effects: p.effects }
      : { requirements: [], effects: [p] }
  );
}

export class PassiveHolder {
  constructor(passiveDefs = []) {
    const groups = normalize(passiveDefs);
    this._effects = groups.flatMap((g) =>
      g.effects.map((raw) => new PersistentEffect(raw, g.requirements))
    );
    this._applied = false;
  }

  static fromDefinition(def) { return new PassiveHolder(def.passives ?? []); }
  get isApplied() { return this._applied; }

  apply(game, strength = 1) { this._start(game, strength, false); }
  prime(game, strength = 1) { this._start(game, strength, true); }

  _start(game, strength, priming) {
    this._applied = true;
    for (const pe of this._effects) {
      if (priming) pe.prime(game, strength);
      else pe.activate(game, strength);
    }
  }

  remove() {
    if (!this._applied) return;
    for (const pe of this._effects) pe.deactivate();
    this._applied = false;
  }

  reapply(game, strength = 1) {
    if (!this._applied) return;
    for (const pe of this._effects) pe.setStrength(strength);
  }

  getState() { return this._effects.map((pe) => pe.getState()); }
  setState(states) {
    this._effects.forEach((pe, i) => { if (states[i]) pe.setState(states[i]); });
  }
}