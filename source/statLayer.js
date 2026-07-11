export class StatLayer {
  constructor({ flat = 0, percent = 1, multiplier = 1 } = {}) {
    this.flat = flat;
    this.percent = percent;
    this.multiplier = multiplier;
    this.dirty = false;
  }

  static fromDefinition(def) {
    return new StatLayer(def);
  }

  get value() {
    return this.flat * this.percent * this.multiplier;
  }

  set({ flat = 0, percent = 1, multiplier = 1 } = {}) {
    this.flat       = flat;
    this.percent    = percent;
    this.multiplier = multiplier;
    this.dirty = true;
    return this;
  }

  change({ flat = 0, percent = 0, multiplier = 1 } = {}) {
    this.flat       += flat;
    this.percent    += percent;
    this.multiplier *= multiplier;
    this.dirty = true;
    return this;
  }

  changeReverse({ flat = 0, percent = 0, multiplier = 1 } = {}) {
    this.flat       -= flat;
    this.percent    -= percent;
    this.multiplier /= multiplier;
    this.dirty = true;
    return this;
  }

  consumeDirty() {
    const was = this.dirty;
    this.dirty = false;
    return was;
  }
}
