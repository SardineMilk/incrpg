import { applyEffect } from "../game/effects.js";
export class CompletionHolder {
  constructor(meterDefs = {}) {
    this.defs = meterDefs;       // keep raw defs around for lazy recreation
    this.meters = new Map();
    for (const [name, def] of Object.entries(meterDefs)) this._createMeter(name, def);
  }

  _createMeter(name, def, start) {
    this.meters.set(name, {
      progress: start ?? def.start ?? 0,
      max: def.max ?? Infinity,
      min: def.min ?? -Infinity,
      resultEffects: def.result ?? [],
      minEffects: def.onMin ?? [],
      repeat: def.repeat ?? true,
      completions: 0,
    });
  }

  static fromDefinition(def) {
    const meterDefs = { ...def.meters };

    // def.duration and def.result are syntactic sugar for common CompletionHolder forms
    if (def.duration != null) meterDefs.duration ??= { max: def.duration, result: def.result ?? [] };
    
    return new CompletionHolder(meterDefs);
  }

  has(name) { return this.meters.has(name); }
  get isTimed() { return this.has("duration"); }

  meterNames() { return [...this.meters.keys()]; }

  progressOf(name = "progress") { return this.meters.get(name)?.progress ?? 0; }
  minOf(name = "progress") { return this.meters.get(name)?.min ?? 0; }
  maxOf(name = "progress") { return this.meters.get(name)?.max ?? 0; }

  // Falls back to standard duration structure
  resetMeter(name, start, fallback = { min: 0, max: Infinity, repeat: false }) {
    this._createMeter(name, this.defs[name] ?? fallback, start);
  }

  clearMeter(name) { this.meters.delete(name); }

  advanceProgress(game, amount, meter = "progress") {
    const m = this.meters.get(meter);
    if (!m) return; // untimed / doesn't track this meter - silent no-op
    m.progress = +(m.progress + amount).toFixed(2);
    return this._checkThresholds(game, m);
  }

  setProgress(game, amount, meter = "progress") {
    const m = this.meters.get(meter);
    if (!m) return; // untimed / doesn't track this meter - silent no-op
    m.progress = +(amount).toFixed(2);
    return this._checkThresholds(game, m);
  }

  _checkThresholds(game, m) {
    if (m.progress >= m.max) {
      m.completions++;
      m.progress = m.repeat ? m.progress - m.max : m.max;
      for (const e of m.resultEffects) applyEffect(game, e);
      return "meterMax";
    }
    if (m.progress <= m.min) {
      m.progress = m.repeat ? m.progress - m.min : m.min;
      for (const e of m.minEffects) applyEffect(game, e);
      return "meterMin";
    }
  }

  setState(s) {
    for (const [name, meterState] of Object.entries(s.meters ?? {})) {
      // TODO - resetMeter is quite hacky, but needed for duration
      this.resetMeter(name, meterState.progress);  
      const m = this.meters.get(name);
      if (m) m.completions = meterState.completions;
    }
  }
  getState() {
    const meters = {};
    for (const [name, m] of this.meters) meters[name] = { progress: m.progress, completions: m.completions };
    return { meters };
  }

}