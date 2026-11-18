import { compileRule } from "../structures/triggerDefs.js";

// Shared between actors. 
// Modifier rules default to the "modify" phase. 
// Because why would they do anything different.
// ^ genuine question, lmk if you find a use case
export class ModifierHolder {
  static shareable = true;

  constructor(modifierDefs = [], id = "?") {
    this.modifierDefs = modifierDefs;
    this.rules = modifierDefs.map((m, i) => compileRule(m, "modify", `${id}.modifiers[${i}]`));
  }

  static fromDefinition(def, id) { return new ModifierHolder(def.modifiers, id); }
  static appliesTo(def) { return (def.modifiers?.length ?? 0) > 0; }
}