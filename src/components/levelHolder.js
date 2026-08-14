import { applyEffect, negateEffect } from "../game/effects.js";
import { StatLayer } from "./statLayer.js";
import { PassiveHolder } from "./passiveHolder.js";

function xpToNext(level) {
  const scalingFactor = 100;
  return Math.floor(scalingFactor * Math.pow(2, level / 5));
}

// TODO - stamina regen is weird with this
// Upon reaching level 1, it is set to 1/10 instead of 11/10

export class LevelHolder {
    constructor(levelEffects = [], milestones = {}, name) {
        this.milestones = milestones || {};
        this.baseLevel = 0;
        this.xp = 0;
        this.xpBonus    = new StatLayer({ flat: 1 });
        this.levelBonus = new StatLayer();
        this.appliedLevel = 0; 
        this.name = name;

        this._levelPassives = new PassiveHolder([{ requirements: [], effects: levelEffects || [] }]);
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
    initPassives(game) { this._levelPassives.apply(game, this.level); }

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

  _syncLevel(game) {
    this._levelPassives.reapply(game, this.level);
    // TODO - PassiveHolder for level milestones
    const target = Math.floor(this.level);
    while (this.appliedLevel < target) {
      this.appliedLevel++;
      for (const e of this.milestones[this.appliedLevel] || []) applyEffect(game, e);
    }
    while (this.appliedLevel > target) {
      for (const e of this.milestones[this.appliedLevel] || []) negateEffect(game, e);
      this.appliedLevel--;
    }
  }
}