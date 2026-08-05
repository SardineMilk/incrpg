export class StatLayer {
  constructor({ flat = 0, percent = 1, multiplier = 1 } = {}) {
    this.flat = flat;
    this.percent = percent;
    this.multiplier = multiplier;
  }

  static fromDefinition(def) {
    return new StatLayer(def.strength ?? { flat: 1 });
  }

  get value() {
    this.preventDrift();
    return this.flat * this.percent * this.multiplier;
  }

  set({ flat = 0, percent = 1, multiplier = 1 } = {}) {
    const dirty =
      this.flat !== flat ||
      this.percent !== percent ||
      this.multiplier !== multiplier;

    if (dirty) {
      this.flat = flat;
      this.percent = percent;
      this.multiplier = multiplier;
    }

    return dirty;
  }

  change({ flat = 0, percent = 0, multiplier = 1 } = {}) {
    const dirty =
      flat !== 0 ||
      percent !== 0 ||
      multiplier !== 1;

    if (dirty) {
      this.flat += flat;
      this.percent += percent;
      this.multiplier *= multiplier;
    }

    return dirty;
  }

  changeReverse({ flat = 0, percent = 0, multiplier = 1 } = {}) {
    const dirty =
      flat !== 0 ||
      percent !== 0 ||
      multiplier !== 1;

    if (dirty) {
      this.flat -= flat;
      this.percent -= percent;
      this.multiplier /= multiplier;
    }

    return dirty;
  }

  // TODO - prevent floating point drift
  preventDrift() {
    return;
  }
}