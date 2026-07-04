import { applyEffect } from "../game/effects";


export class Completable {
    constructor(duration, resultEffects = []) {
        this.resultEffects = resultEffects;  // Static eff.* definitions, never mutated
        this.duration = duration;
        this.progress = 0;
        this.completions = 0;
    }

    advanceProgress(game, amount = 1) {
        this.progress += amount;
        this._checkCompletion(game);
    }

    _checkCompletion(game) {
        while (this.progress >= this.duration) {
            this.completions++;
            this.progress -= this.duration;
            for (const effect of this.resultEffects) applyEffect(game, effect);
        }
    }
}