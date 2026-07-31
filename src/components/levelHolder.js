import { applyEffect, negateEffect } from "../game/effects.js";
import { StatLayer } from "./statLayer.js";

function xpToNext(level) {
  const scalingFactor = 100;
  return Math.floor(scalingFactor * Math.pow(2, level / 5));
}

export class LevelHolder {
    constructor(levelEffects = [], milestones = {}, name) {
        this.levelEffects = levelEffects || [];
        this.milestones = milestones || {};

        // baseLevel, used for xp curve and not much else
        this.baseLevel = 0;

        this.xp = 0;
        this.xpBonus    = new StatLayer({flat:1});
        this.levelBonus = new StatLayer();
        this.appliedLevel = 0;

        this.name = name;
    }

    static fromDefinition(def) {
        return new LevelHolder(
            def.level,
            def.milestones,
            def.name
        );
    }

    get level() {
        return (this.baseLevel + this.levelBonus.flat) * this.levelBonus.percent * this.levelBonus.multiplier;
    }

    gainXp(game, amount) {
        this.xp += amount * this.xpBonus.value;
        this._checkXpProgress(game);
    }

    _checkXpProgress(game) {
        while (this.xp >= xpToNext(this.baseLevel)) {
            this.xp -= xpToNext(this.baseLevel);
            this.baseLevel++;
            applyEffect(game, {
                type: "sendMessage",
                category: "LEVEL",
                message: `${this.name} leveled to ${this.baseLevel}`
            });
        }
        this._syncLevel(game);
    }

    // Any changes to levelBonus must go through here
    changeLevelBonus(game, statChange) {
        this.levelBonus.change(statChange);
        this._syncLevel(game);
    }

    changeLevelBonusReverse(game, statChange) {
        this.levelBonus.changeReverse(statChange);
        this._syncLevel(game);
    }

    // Diffs appliedLevel against the current modified level and applies/removes level+milestone effects
    _syncLevel(game) {
        const target = Math.floor(this.level);

        while (this.appliedLevel < target) {
            this.appliedLevel++;
            this._applyLevelEffects(game, this.appliedLevel);
        }

        while (this.appliedLevel > target) {
            this._negateLevelEffects(game, this.appliedLevel);
            this.appliedLevel--;
        }
    }

    _applyLevelEffects(game, level) {
        for (const effect of this.levelEffects) applyEffect(game, effect);

        const milestoneEffects = this.milestones[level] || [];
        for (const effect of milestoneEffects) applyEffect(game, effect);


    }

    _negateLevelEffects(game, level) {
        const milestoneEffects = this.milestones[level] || [];
        for (const effect of milestoneEffects) negateEffect(game, effect);

        for (const effect of this.levelEffects) negateEffect(game, effect);
    }
}