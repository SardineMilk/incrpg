import { ACTIONS } from "../data/actionsData.js";
import { calculateActionCompetency } from "../game/actions.js";
import { applyEffect } from "../game/effects.js";

export function renderActions(game) {
  const container = document.getElementById("actions-box");
  if (!container) return;

  for (const actionId in ACTIONS) {
    const action = ACTIONS[actionId];
    const state = game.actionStates[actionId] || {
      progress: 0,
      completions: 0,
      competency: 1,
    };

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
        applyEffect(game, {type:"setActiveAction", action:actionId});
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

    button.textContent = `${action.name}`;
    info.innerText = `${Math.round(state.completableHolder.progress)}/${action.duration}`;
    entry.classList.toggle("active-action", game.activeAction === actionId);
  }
}
