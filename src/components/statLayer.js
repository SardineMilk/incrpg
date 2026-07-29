export class StatLayer {
  constructor({ flat = 0, percent = 1, multiplier = 1 } = {}) {
    this.flat = flat;
    this.percent = percent;
    this.multiplier = multiplier;
  }

  static fromDefinition(def) {
    return new StatLayer({ flat: 1});
  }

  get value() {
    this.preventDrift()
    return this.flat * this.percent * this.multiplier;
  }

  set({ flat = 0, percent = 1, multiplier = 1 } = {}) {
    this.flat       = flat;
    this.percent    = percent;
    this.multiplier = multiplier;
    return this;
  }

  change({ flat = 0, percent = 0, multiplier = 1 } = {}) {
    this.flat       += flat;
    this.percent    += percent;
    this.multiplier *= multiplier;
    return this;
  }

  changeReverse({ flat = 0, percent = 0, multiplier = 1 } = {}) {
    this.flat       -= flat;
    this.percent    -= percent;
    this.multiplier /= multiplier;
    return this;
  }

  preventDrift() {
    this.flat       = Math.round(this.flat, 3);
    this.percent    = Math.round(this.percent, 3);
    this.multiplier = Math.round(this.multiplier, 3);
  }
}
