import { applyEffect, negateEffect } from "../game/effects.js";
import { StatLayer } from "./statLayer.js";
import { PassiveHolder } from "./passiveHolder.js";
import { req } from "../structures/requirementDefs.js";
import { fml } from "../structures/formulaDefs.js";
import { xpToNext } from "../utils/math.js";
import { processTrigger } from "../game/events.js";


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
        this.id = id;

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
        game.reactor.notify(`xp:${this.id}`);
    }

    _checkXpProgress(game) {
        while (this.xp >= xpToNext(this.baseLevel)) {
            processTrigger(game, "levelUp", { id:this.id, level:this.baseLevel+1 }, "pre")
            this.xp -= xpToNext(this.baseLevel);
            this.baseLevel++;
            processTrigger(game, "levelUp", { id:this.id, level:this.baseLevel }, "post")
        }
        while (this.xp < 0) {
            processTrigger(game, "levelDown", { id:this.id, level:this.baseLevel-1 }, "pre")
            this.xp += xpToNext(this.baseLevel-1);
            this.baseLevel--;
            processTrigger(game, "levelDown", { id:this.id, level:this.baseLevel }, "post")
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

    getState() {
        return {
            baseLevel: this.baseLevel, xp: this.xp,
            xpBonus: { ...this.xpBonus }, levelBonus: { ...this.levelBonus },
            levelPassives: this._levelPassives.getState(),
            milestonePassives: this._milestonePassives.getState(),
        };
    }
    setState(s) {
        this.baseLevel = s.baseLevel; this.xp = s.xp;
        Object.assign(this.xpBonus, s.xpBonus);
        Object.assign(this.levelBonus, s.levelBonus);
        this._levelPassives.setState(s.levelPassives);
        this._milestonePassives.setState(s.milestonePassives);
    }
}