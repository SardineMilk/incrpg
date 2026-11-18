

export const LogType = {
  SKILL: 1 << 0,
  ACTION: 1 << 1,
  ITEM: 1 << 2,
  DIALOGUE: 1 << 3,
  SYSTEM: 1 << 4,
};

// Every actor gets one of these, viewed or not, so the cap is what stops
// a swarm of NPCs from accumulating unread history forever.
const DEFAULT_MAX_EVENTS = 1000;

export class EventLog {
  constructor({ reactor = null, id, maxEvents = DEFAULT_MAX_EVENTS } = {}) {
    this.events = [];
    this.maxEvents = maxEvents;

    // Total events trimmed from the front. Views use this to keep a reader's
    // scroll position stable while old rows fall off the top.
    this.dropped = 0;

    this._reactor = reactor;
    this._cellKey = `log:${id}`;
  }

  append(type, text) {
    this.events.push({ type, text });
    while (this.events.length > this.maxEvents) {
      this.events.shift();
      this.dropped++;
    }
    this._reactor?.notify(this._cellKey);
  }

  // Returns an unsubscribe function. Views never need to know the cell key.
  subscribe(run) {
    if (!this._reactor) return () => {};
    // Reactor requires a Set (notify() checks sub.cellKeys.has)
    const sub = this._reactor.subscribe(new Set([this._cellKey]), run);
    return () => this._reactor.unsubscribe(sub);
  }
}