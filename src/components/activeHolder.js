// Tracks whether something (a condition, buff, etc.) is currently "on",
// and for how much longer.
//
//   duration === null   -> active indefinitely, until explicitly deactivated
//   duration > 0         -> active, counts down towards 0
//   duration <= 0         -> expired (caller should deactivate)

export class ActiveHolder {
  constructor() {
    this.active = false;
    this.duration = null;
  }

  // True only for conditions that are both active AND not indefinite
  get isTimed() {
    return this.active && this.duration !== null;
  }

  // Turn on. duration of null means indefinite.
  activate(duration = null) {
    this.active = true;
    this.duration = duration;
  }

  deactivate() {
    this.active = false;
    this.duration = null;
  }

  // Adjust duration by `amount`. Returns true if this pushed duration <= 0
  // (i.e. the caller should treat it as expired now).
  // Always returns false if inactive or indefinite.
  changeDuration(amount) {
    if (!this.active || this.duration === null) return false;
    this.duration += amount;
    return this.duration <= 0;
  }
}