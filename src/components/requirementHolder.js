import { meetsRequirements } from "../game/requirements.js";

export class RequirementHolder {
    constructor(id, reqs) {
        this.reqs = reqs;
        this.state = true; // TODO - what should this be initialised to?

        this._id = id 
        this._onTrueCallback = null
        this._onFalseCallback = null
    }

    static fromDefinition(def, id) {
        const r = def.requirements;
        if (!r) return new RequirementHolder(id);
        return new RequirementHolder(id, r); 
    }

    wire(game, onTrueCallback, onFalseCallback) {
        this._onTrueCallback = onTrueCallback
        this._onFalseCallback = onFalseCallback
        this._reconcile(game);
    }

    unwire(game) {
        if (this._subs) game.reactor.unsubscribe(this._subs);
        this._callback = null;
    }

    _reconcile(game) {
        const { results, deps } = game.reactor.track(() =>
            this.reqs.length === 0 ? true : meetsRequirements(game, { requirements: this.reqs })
        );

        if (this._subs) game.reactor.resubscribe(this._subs, deps);
        else if (deps.size > 0) this._subs = game.reactor.subscribe(deps, () => this._reconcile(game))  // <- hope this works ...

        const changed = this.state !== result;
        this.state = result;
        if (!changed) return;

        if (result) this._onTrueCallback();
        else        this._onFalseCallback();
    }

    // Fresh, unwired, unmemoized, in my lane, flourishing
    static evaluate(game, reqs) {
        return reqs.length === 0 ? true : meetsRequirements(game, { requirements: reqs });
    }

}

// TODO - passing the correct property should be done at the call site of fromDefinition, not as subclasses
// This might need a rewrite of the way holders are represented? Name:Holder pairs to allow multiple per entity?

export class DormantHolder extends RequirementHolder {
    static fromDefinition(def, id) {
        const r = def.application;
        if (!r) return new RequirementHolder(id);
        return new RequirementHolder(id, r); 
    }
}


export class VisibilityHolder extends RequirementHolder {
    static fromDefinition(def, id) {
        const r = def.visibility;
        if (!r) return new RequirementHolder(id);
        return new RequirementHolder(id, r); 
    }
}