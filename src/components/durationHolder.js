export class DurationHolder {
  constructor() {
    this.duration = null;
  }

  static fromDefinition() {
    return new DurationHolder();
  }

  get isTimed() {
    return this.duration !== null;
  }

  set(amount) {
    this.duration = amount;
  }

  change(amount) {
    if (this.duration === null) return;
    this.duration += amount;
  }
}