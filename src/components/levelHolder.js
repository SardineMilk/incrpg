import { applyEffect, negateEffect } from "../game/effects.js";
import { StatLayer } from "./statLayer.js";
import { PassiveHolder } from "./passiveHolder.js";
import { req } from "../structures/requirementDefs.js";
import { fml } from "../structures/formulaDefs.js";

function xpToNext(level) {
  const scalingFactor = 100;
  return Math.floor(scalingFactor * Math.pow(2, level / 5));
}

// TODO - stamina regen is weird with this
// Upon reaching level 1, it is set to 1/10 instead of 11/10

export class LevelHolder {
    constructor(levelEffects = [], milestones = {}, name, id) {
        this.milestones = milestones || {};
        this.baseLevel = 0;
        this.xp = 0;
        this.xpBonus    = new StatLayer({ flat: 1 });
        this.levelBonus = new StatLayer();
        this.appliedLevel = 0; 
        this.name = name;

        this._levelPassives = new PassiveHolder([{ requirements: [], effects: levelEffects || [] }]);
    
        this._milestonePassives = new PassiveHolder(
            Object.entries(this.milestones).map(([levelStr, effects]) => ({
                requirements: [req.geq(fml.level(id), Number(levelStr))],
                effects,
            }))
        );
    }

    static fromDefinition(def, id) {
        return new LevelHolder(
            def.level,
            def.milestones,
            def.name,
            id
        );
    }

    get level() {
        return (this.baseLevel + this.levelBonus.flat) * this.levelBonus.percent * this.levelBonus.multiplier;
    }
    initPassives(game) { 
        this._levelPassives.apply(game, this.level); 
        this._milestonePassives.apply(game, 1);
    }
    primePassives(game) {
        this._levelPassives.prime(game, this.level);
        this._milestonePassives.prime(game, 1);
    }

    gainXp(game, amount) {
        this.xp += amount * this.xpBonus.value;
        this._checkXpProgress(game);
    }

    _checkXpProgress(game) {
        while (this.xp >= xpToNext(this.baseLevel)) {
            this.xp -= xpToNext(this.baseLevel);
            this.baseLevel++;
            // TODO - replace with evt.levelUp(id) trigger
            // possibly modifier too?
            applyEffect(game, {
                type: "sendMessage",
                category: "LEVEL",
                message: `${this.name} leveled to ${this.baseLevel}`
            });
        }
        this._levelPassives.reapply(game, this.level);

    }

    // Any changes to levelBonus must go through here
    changeLevelBonus(game, statChange) {
        this.levelBonus.change(statChange);
        this._levelPassives.reapply(game, this.level);
    }
    changeLevelBonusReverse(game, statChange) {
        this.levelBonus.changeReverse(statChange);
        this._levelPassives.reapply(game, this.level);
    }
}