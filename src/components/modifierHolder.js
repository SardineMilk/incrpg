import { TriggerHolder } from "./triggerHolder.js";

// TODO - can i let components use custom names?
// it would let StatLayer strength be more intuitive
// and remove the need for this wrapper class
export class ModifierHolder extends TriggerHolder {
  static fromDefinition(def) {
    return new ModifierHolder(
      def.modifiers ?? [],
    );
  }

  static appliesTo(def) {
    return (def.modifiers?.length ?? 0) > 0;
  }

}