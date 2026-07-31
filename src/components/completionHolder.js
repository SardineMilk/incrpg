import { applyEffect } from "../game/effects.js";

/*
* CompletionHolder gives the entity a duration
* advanceProgress() increases the progress variable
* When it reaches the duration, progress is reset
* And resultEffects are triggered
*
* This pattern is used for Actions and Activities
*/

export class CompletionHolder {
    constructor(duration, resultEffects = []) {
        this.resultEffects = resultEffects;  // Static eff.* definitions, never mutated
        this.duration = duration;
        this.progress = 0;
        this.completions = 0;
    }

    static fromDefinition(def) {
        return new CompletionHolder(
            def.duration,
            def.result
        );
    }

    advanceProgress(game, amount = 1) {
        this.progress += +(amount).toFixed(2);
        this._checkCompletion(game);
    }

    _checkCompletion(game) {
        /*
        // This allows multiple completions per advance, but breaks on `duration <= 0`
        // TODO - design an elegant way for <=0 duration CompletionHolders to work
        while (this.progress >= this.duration) {
            this.completions++;
            this.progress -= this.duration;
            for (const effect of this.resultEffects) applyEffect(game, effect);
        }
        */
        if (this.progress >= this.duration) {
            this.completions++;
            this.progress -= this.duration;
            for (const effect of this.resultEffects) applyEffect(game, effect);
        }
    }
}