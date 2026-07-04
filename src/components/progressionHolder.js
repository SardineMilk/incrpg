import { applyEffect } from "../game/effects.js";
import { makeStatLayer, resolveStatLayer } from "../utils/statLayer.js";


function xpToNext(level) {
  const scalingFactor = 100;
  return Math.floor(scalingFactor * Math.pow(2, level / 5));
}

export class ProgressionHolder {
    constructor(levelEffects = [], milestones = {}, name) {
        this.levelEffects = levelEffects || [];
        this.milestones = milestones || {};
        this.baseLevel = 0;  // Level without levelBonus, used for level up requirements
        this.xp = 0;
        this.xpBonus = makeStatLayer();
        this.levelBonus = makeStatLayer();

        // TODO this should be part of StatLayer construction
        this.xpBonus.flat = 1;

        // TODO this is ugly
        this.name = name;
    }

    getLevel() {
        // TODO this really should use StatLayer logic, not custom
        return (this.baseLevel + this.levelBonus.flat) * this.levelBonus.percent * this.levelBonus.multiplier; 
    }

    grantXp(game, amount) {
        this.xp += amount * resolveStatLayer(this.xpBonus);
        this._checkLevelProgress(game);
    }

    _checkLevelProgress(game) {
        while (this.xp >= xpToNext(this.baseLevel)) {
            this._levelUp(game);

            applyEffect(game, {
                type:"sendMessage", 
                category:"LEVEL", 
                message:`${this.name} leveled to ${this.baseLevel}`
            })
        }
    }

    _levelUp(game) {
        this.xp -= xpToNext(this.baseLevel);
        this.baseLevel++;

        for (const effect of this.levelEffects) applyEffect(game, effect);

        const milestoneEffects = this.milestones[this.baseLevel] || [];
        for (const effect of milestoneEffects) applyEffect(game, effect);
    }
}
