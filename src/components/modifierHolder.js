import { TriggerHolder } from "./triggerHolder.js";

export class ModifierHolder extends TriggerHolder {
  static fromDefinition(def) {
    return new ModifierHolder(
      def.modifiers ?? [],
    );
  }
}