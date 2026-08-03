import { applyEffect } from "../game/effects.js";
import { byTag, nameOf } from "../utils/tagIndex.js";

export function renderActions(game) {
  const container = document.getElementById("actions-box");
  if (!container) return;

  for (const actionId of byTag("actions")) {
    const completionHolder = game.registry.get(actionId, "CompletionHolder");
    const durationHolder = game.registry.get(actionId, "DurationHolder");

    let entry = container.querySelector(`[data-action="${actionId}"]`);

    let button;
    let info;

    if (!entry) {
      entry = document.createElement("div");
      entry.className = "action-entry";
      entry.dataset.action = actionId;

      button = document.createElement("button");
      button.type = "button";
      button.className = "action-button";

      button.addEventListener("click", () => {
        applyEffect(game, {
          type: "activate",
          id: actionId
        });
      });

      info = document.createElement("div");
      info.className = "action-info";

      entry.appendChild(button);
      entry.appendChild(info);
      container.appendChild(entry);
    } else {
      button = entry.querySelector(".action-button");
      info = entry.querySelector(".action-info");
    }

    button.textContent = nameOf(actionId);

    const progress = completionHolder?.progressOf("progress") ?? 0;
    const max = completionHolder?.maxOf("progress") ?? action.duration ?? 0;
    info.innerText = `${Math.round(progress)}/${max}`;

    entry.classList.toggle("active-action", game.active.isActive(actionId));
  }
}