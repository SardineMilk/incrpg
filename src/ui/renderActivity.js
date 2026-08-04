import { sel } from "../structures/structures.js";
import { nameOf } from "../utils/tagIndex.js";

/*
 * Shows the currently active activity (if any) and each of its meters as a
 * labelled progress bar.
 *
 * "Current activity" is defined the same way the engine itself defines it:
 * the active entity tagged "activities" (see sel.active(sel.tags(...)) used
 * throughout conditionsData.js/effectDefs.js). We deliberately reuse that
 * selector instead of hand-rolling a byTag+isActive scan, so there's one
 * definition of "the active activity" shared by game logic and UI.
 *
 * activity_exclusivity (conditionsData.js) is what normally guarantees at
 * most one active activity. That guarantee is a *condition*, not an engine
 * invariant - the whole point of the conditions system (per the design notes
 * in conditionsData.js) is that it's meant to be breakable by sufficiently
 * clever play. So this renders defensively: if more than one activity is
 * somehow active, it picks the first and logs a warning rather than
 * silently hiding the discrepancy or throwing.
 */
export function renderActivity(game) {
  const container = document.getElementById("activity-box");
  if (!container) return;

  const activeActivities = sel.active(sel.tags("activities"))(game);

  if (activeActivities.length === 0) {
    if (container.dataset.activity) {
      container.innerHTML = "";
      delete container.dataset.activity;
    }
    return;
  }

  if (activeActivities.length > 1) {
    console.warn(
      `renderActivity: expected at most one active activity, found ${activeActivities.length} ` +
      `(${activeActivities.join(", ")}). Rendering the first - activity_exclusivity may be down.`
    );
  }

  const activityId = activeActivities[0];
  const holder = game.registry.get(activityId, "CompletionHolder");

  let nameEl, metersEl;

  if (container.dataset.activity !== activityId) {
    container.innerHTML = "";
    container.dataset.activity = activityId;

    nameEl = document.createElement("div");
    nameEl.className = "activity-name";
    container.appendChild(nameEl);

    metersEl = document.createElement("div");
    metersEl.className = "activity-meters";
    container.appendChild(metersEl);
  } else {
    nameEl = container.querySelector(".activity-name");
    metersEl = container.querySelector(".activity-meters");
  }

  nameEl.textContent = nameOf(activityId);

  if (!holder) {
    metersEl.innerHTML = "";
    return;
  }

  const meterNames = holder.meterNames();

  for (const meterName of meterNames) {
    renderMeterRow(metersEl, meterName, holder);
  }

  // Meters are static per-activity in practice, but don't assume it -
  // drop any stale rows left over from a meter that no longer exists.
  const stillValid = new Set(meterNames);
  for (const row of [...metersEl.children]) {
    if (!stillValid.has(row.dataset.meter)) row.remove();
  }
}

function renderMeterRow(metersEl, meterName, holder) {
  let row = metersEl.querySelector(`[data-meter="${meterName}"]`);
  let label, fill;

  if (!row) {
    row = document.createElement("div");
    row.className = "activity-meter-row";
    row.dataset.meter = meterName;

    label = document.createElement("div");
    label.className = "activity-meter-label";

    const bar = document.createElement("div");
    bar.className = "activity-meter-bar";

    fill = document.createElement("div");
    fill.className = "activity-meter-bar-fill";

    bar.appendChild(fill);
    row.appendChild(label);
    row.appendChild(bar);
    metersEl.appendChild(row);
  } else {
    label = row.querySelector(".activity-meter-label");
    fill = row.querySelector(".activity-meter-bar-fill");
  }

  const progress = holder.progressOf(meterName);
  const max = holder.maxOf(meterName);
  const min = holder.minOf(meterName);

  const effectiveMin = Number.isFinite(min) ? min : 0;
  const range = max - effectiveMin;
  const pct = Number.isFinite(max) && range > 0
    ? Math.min(100, Math.max(0, ((progress - effectiveMin) / range) * 100))
    : 0;

  const maxLabel = Number.isFinite(max) ? Math.round(max) : "\u221e";
  label.textContent = `${capitalize(meterName)}: ${Math.round(progress)}/${maxLabel}`;
  fill.style.width = `${pct}%`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}