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
        this.baseLevel = 0;  // Level without levelBonus, used for level up requirements
        this.xp = 0;
        this.xpBonus    = new StatLayer({flat:1});
        this.levelBonus = new StatLayer();
        this.name = name; // TODO this is ugly
    }

    static fromDefinition(def) {
        return new LevelHolder(
            def.level,
            def.milestones,
            def.name
        );
    }

    get level() {
        // TODO this really should use StatLayer logic, not custom
        return (this.baseLevel + this.levelBonus.flat) * this.levelBonus.percent * this.levelBonus.multiplier; 
    }

    gainXp(game, amount) {
        this.xp += amount * this.xpBonus.value;
        this._checkLevelProgress(game);
    }

    _checkLevelProgress(game) {
        while (this.xp >= xpToNext(this.baseLevel)) {
            this._levelUp(game);
        }

        while (this.baseLevel > 0 && this.xp < 0) {
            this._levelDown(game);
        }

        // Should Xp debt be a feature? 
        // Probably, if not it should be condition instead of baked in
        // TODO - edge case testing for negative level and xp debt
        if (this.baseLevel === 0 && this.xp < 0) {
            this.xp = 0;
        }
    }

    // TODO - this only applies to baseLevel, not bonusLevel
    // Temporary bonuses should apply level effects and milestones
    // But they *shouldn't* affect current xp or the xp curve
    _levelUp(game) {
        this.xp -= xpToNext(this.baseLevel);
        this.baseLevel++;

        for (const effect of this._effectsForLevel(this.baseLevel)) {
            applyEffect(game, effect);
        }

        applyEffect(game, {
            type:"sendMessage", 
            category:"LEVEL", 
            message:`${this.name} leveled to ${this.baseLevel}`
        });
    }

    _levelDown(game) {
        const effects = this._effectsForLevel(this.baseLevel);

        for (let i = effects.length - 1; i >= 0; i--) {
            negateEffect(game, effects[i]);
        }

        this.baseLevel--;
        this.xp += xpToNext(this.baseLevel);

        applyEffect(game, {
            type:"sendMessage", 
            category:"LEVEL", 
            message:`${this.name} lost a level, now ${this.baseLevel}`
        });
    }


    _effectsForLevel(level) {
        const milestoneEffects = this.milestones[level] || [];
        return [...this.levelEffects, ...milestoneEffects];
    }
}