import { check } from "./requirements.js";
import { resolveFormulas } from "../structures/formulaDefs.js";
import { MODIFIER_DEFS } from "../structures/modifierDefs.js";

// Scale a modifier op by its owner's strength, if the op supports it
const scale = (game, op, s) => {
  const def = MODIFIER_DEFS[op.type];
  return s === 1 || !def.scale ? op : def.scale(game, op, s);
};

// One per actor. Holds the compiled rules of every active entity, indexed by phase and event type.
export class EventBus {
  constructor(game) {
    this.game = game;
    // phase -> type -> Listener[]. Arrays are replaced on change, not mutated
    this.by = { pre: new Map(), post: new Map(), modify: new Map() };
    this.owned = new Map(); // entity id -> its Listeners
  }

  // Start listening for an entity's rules (called when it activates)
  attach(id) {
    const reg = this.game.registry;
    const rules = [
      ...(reg.get(id, "TriggerHolder")?.rules ?? []),
      ...(reg.get(id, "ModifierHolder")?.rules ?? []),
    ];
    if (!rules.length) return;

    const mine = rules.map((rule) => ({ id, rule, dead: false }));
    for (const l of mine) {
      const slot = this.by[l.rule.phase];
      slot.set(l.rule.type, [...(slot.get(l.rule.type) ?? []), l]);
    }
    this.owned.set(id, mine);
  }

  // Stop listening for an entity's rules (called when it deactivates)
  detach(id) {
    const mine = this.owned.get(id);
    if (!mine) return;
    this.owned.delete(id);
    for (const l of mine) {
      l.dead = true; // skipped by any dispatch currently trying to use this
      const slot = this.by[l.rule.phase];
      const rest = slot.get(l.rule.type).filter((x) => x !== l);
      if (rest.length) slot.set(l.rule.type, rest);
      else slot.delete(l.rule.type);
    }
  }

  // Run every matching rule's effects. The payload is the context frame while they run.
  emit(type, payload, phase = "post") {
    const list = this.by[phase].get(type);
    if (!list || this.game.dead) return;

    this.game.context.with(payload, () => {
      for (const l of list) {
        if (!this._applies(l, payload)) continue;
        this.emit("onTrigger", { id: l.id }, "pre");
        this._react(l);
        this.emit("onTrigger", { id: l.id }, "post");
      }
    }, `${phase}:${type}`);
  }

  // Pass a resolved effect through every matching modifier, in activation order.
  // Most cases will return effect unchanged, nothing modifies it
  modify(effect) {
    const list = this.by.modify.get(effect.type);
    if (!list) return effect;

    const { game } = this;
    const label = `modify:${effect.type}`;
    let cur = effect;

    for (const l of list) {
      const before = cur;
      if (!game.context.with(before, () => this._applies(l, before), label)) continue;

      // Each op sees the result of the previous one
      const s = this._strength(l);
      for (const op of l.rule.modify) {
        const frame = cur;
        cur = game.context.with(frame, () =>
          MODIFIER_DEFS[op.type].apply(frame, resolveFormulas(game, scale(game, op, s))), label);
      }
      // Side effects run after the rewrite, seeing the modified effect
      if (l.rule.effects.length) game.context.with(cur, () => this._react(l), label);
    }
    return cur;
  }

  // Can this listener fire for this payload right now?
  _applies(l, payload) {
    const { game } = this;
    return !l.dead
      && game.registry.get(l.id, "DormantHolder")?.state !== false
      && l.rule.match(game, payload)
      && check(game, l.rule.requirements);
  }

  // Owner's current strength. read at fire time so it's not stale
  _strength(l) {
    return this.game.registry.get(l.id, "StatLayer")?.value ?? 1;
  }

  // Apply a rule's effects, scaled by its owner's strength
  _react(l) {
    const s = this._strength(l);
    for (const e of l.rule.effects) this.game.world.applyEffect(this.game, e, s);
  }
}