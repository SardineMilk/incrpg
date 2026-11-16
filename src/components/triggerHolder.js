import { compileRule } from "../structures/triggerDefs.js";

// Shared between actors. Holds compiled rules only; the EventBus does the dispatching.
export class TriggerHolder {
  static shareable = true;

  constructor(triggerDefs = [], id = "?") {
    this.triggerDefs = triggerDefs;
    this.rules = triggerDefs.map((t, i) => compileRule(t, "post", `${id}.triggers[${i}]`));
  }

  static fromDefinition(def, id) { return new TriggerHolder(def.triggers, id); }
  static appliesTo(def) { return (def.triggers?.length ?? 0) > 0; }
}