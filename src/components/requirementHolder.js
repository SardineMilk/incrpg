import { check } from "../game/requirements.js";

export class RequirementHolder {
  constructor(id, formula = null) {
    this.formula = formula;
    this._id = id;
    this.state = null;
    this._subs = null;
    this._onTrueCallback = null;
    this._onFalseCallback = null;
  }

  static fromDefinition(def, id) {
    return new this(id, def.requirements);
  }

  static appliesTo(def) {
    return !!def.requirements;
  }

  clone() {
    return new this.constructor(this._id, this.formula);
  }

  wire(game, onTrueCallback, onFalseCallback) {
    this._onTrueCallback = onTrueCallback;
    this._onFalseCallback = onFalseCallback;
    this._reconcile(game);
  }

  unwire(game) {
    if (this._subs) {
      game.reactor.unsubscribe(this._subs);
      this._subs = null;
    }
    this._onTrueCallback = null;
    this._onFalseCallback = null;
    this.state = null;
  }

  _reconcile(game) {
    const { result, deps } = game.reactor.track(() => check(game, this.formula));

    if (this._subs) game.reactor.resubscribe(this._subs, deps);
    else if (deps.size > 0) this._subs = game.reactor.subscribe(deps, () => this._reconcile(game));

    const changed = this.state !== result;
    this.state = result;
    if (!changed) return;

    if (result) this._onTrueCallback?.();
    else this._onFalseCallback?.();
  }

  // Fresh, unwired, unmemoized, in my lane, flourishing
  static evaluate(game, formula) {
    return check(game, formula);
  }
}

export class DormantHolder extends RequirementHolder {
  static fromDefinition(def, id) {
    return new this(id, def.application);
  }
  static appliesTo(def) {
    return !!def.application;
  }
}

export class VisibilityHolder extends RequirementHolder {
  static fromDefinition(def, id) {
    return new this(id, def.visibility);
  }
  static appliesTo(def) {
    return !!def.visibility;
  }
}
