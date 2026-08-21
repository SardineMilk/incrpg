import { req, fml, sel } from "../structures/structures.js";
import { ui } from "../ui/widgetDefs.js";
import { byTag, nameOf } from "../utils/tagIndex.js";

import { EFFECT_DEFS } from "../structures/effectDefs.js";
import { TRIGGER_DEFS } from "../structures/triggerDefs.js";

// TODO - don't use the raw data files
// Probably add a new holder? Or use the tag registry because thats the answer to everything
import { ACTIONS } from "./actionsData.js";
import { ACTIVITIES } from "./activitiesData.js";

const CHARACTERISTICS = [
  "constitution", "strength",
  "agility", "wit",
  "intelligence", "willpower",
];
const CHARACTERISTIC_SET = new Set(CHARACTERISTICS);

function activeLocationLabel(game) {
  const names = sel.active(sel.tags("locations"))(game).map(nameOf);
  return `Location: ${names.join(" ")}`;
}

function describeAction(game, id) {
  const def = ACTIONS[id];
  if (!def) return "";

  const lines = [];
  // TODO - group effects by trigger
  // Each tick: eff1, eff2, eff3
  // Also triggers aren't guaranteed to be tick(), that needs changed
  // Use TRIGGER_DEFS[trig.type].display
  for (const trig of def.triggers ?? []) {
    for (const e of trig.effects ?? []) {
      const line = EFFECT_DEFS[e.type]?.display?.(game, e);
      if (line) lines.push(`Each tick: ${line}`);
    }
  }
  for (const e of def.result ?? []) {
    const line = EFFECT_DEFS[e.type]?.display?.(game, e);
    if (line) lines.push(`On completion: ${line}`);
  }
  return lines.join("\n") || def.name;
}

// In case I want to special-case multiple active activities later
function activeActivityIds(game) {
  const active = sel.active(sel.tags("activities"))(game);
  return active;
}



export const PANELS = {
  hero: {
    container: "hero-panel",
    root: ui.group([
      ui.text("Hero", { className: "name-box" }),
      ui.group([
        ui.bar(fml.value("health"),  fml.value("healthMax"),  { label: "HP", className: "resource-bar" }),
        ui.bar(fml.value("stamina"), fml.value("staminaMax"), { label: "SP", className: "resource-bar" }),
        ui.bar(fml.value("mental"),  fml.value("mentalMax"),  { label: "MP", className: "resource-bar" }),
      ]),
      ui.group(
        CHARACTERISTICS.map((id) =>
          ui.text(fml.level(id), {
            className: "attribute-box",
            format: (level) => `${nameOf(id)}: ${level}`,
          })
        ),
        { className: "stats-box" }
      ),
      ui.text(activeLocationLabel, { className: "location-box" }),
    ]),
  },

  actions: {
    container: "actions-panel",
    root: ui.list(
      sel.tags("actions"),
      (id) => ui.group([
        ui.button(
          nameOf(id),
          (game, rowId) => [{ type: game.active.isActive(rowId) ? "deactivate" : "activate", id: rowId }],
          {
            className: "action-button",
            active: (game, rowId) => {
              game.reactor.read(`active:${rowId}`);
              return game.active.isActive(rowId);
            },
          }
        ),
        ui.bar(
          fml.progress(id, "progress"),
          (game) => game.registry.get(id, "CompletionHolder")?.maxOf("progress") ?? 0,
          { className: "action-progress" }
        ),
      ], {
        className: "action-option",
        requirements: ACTIONS[id]?.requirements ?? [],
        tooltip: {
          content: (game, rowId) => ui.text(describeAction(game, rowId)),
        },
      }),
      { className: "actions-list" }
    ),
  },

  activity: {
    container: "activity-panel",
    root: ui.group([
      // Every possible activity, shown only when none are active
      ui.list(
        (game) => (activeActivityIds(game).length > 0 ? [] : byTag("activities")),
        (id) => ui.group([
          ui.button(nameOf(id), (game, rowId) => [{ type: "activate", id: rowId }], {
            className: "activity-button",
          }),
        ], {
          className: "activity-option",
          requirements: ACTIVITIES[id]?.requirements ?? [],
        }),
        { className: "activities-list" }
      ),
 
      // The active activity screen, shown only while one is active
      ui.list(
        (game) => activeActivityIds(game).slice(0, 1),
        (id) => ui.group([
          ui.text(nameOf(id), { className: "activity-name" }),
          ui.list(
            () => Object.keys(ACTIVITIES[id]?.meters ?? {}),
            (meterName) => ui.bar(
              fml.progress(id, meterName),
              (game) => game.registry.get(id, "CompletionHolder")?.maxOf(meterName) ?? 0,
              {
                min: (game) => game.registry.get(id, "CompletionHolder")?.minOf(meterName) ?? 0,
                label: meterName.charAt(0).toUpperCase() + meterName.slice(1),
                className: "activity-meter-row",
              }
            ),
            { className: "activity-meters" }
          ),
          ui.button("Leave Activity", (game, rowId) => [{ type: "deactivate", id: rowId }], {
            className: "leave-activity-button",
          }),
        ], { className: "activity-box" })
      ),
    ]),
  },


  skills: {
    container: "skills-panel",
    root: ui.list(
      () => byTag("skills").filter((id) => !CHARACTERISTIC_SET.has(id)),
      (id) => ui.group([
        ui.text(fml.level(id), { format: (level) => `${nameOf(id)}: ${level}` }),
        ui.bar(fml.xp(id), fml.xpToNext(id), { className: "skill-progress" }),
      ], {
        className: "skill-entry",
        requirements: [[
          req.geq(fml.level(id), 1),
          req.geq(fml.xp(id), fml.div(fml.xpToNext(id), 2)),
        ]],
        // TODO - skill level effects and milestones
        tooltip: {
          content: (game, rowId) => ui.group([
            ui.text(fml.level(rowId), { format: (level) => `${nameOf(rowId)} - Level ${level}` }),
            ui.text((g) => `${Math.floor(fml.xp(rowId)(g))} / ${fml.xpToNext(rowId)(g)} xp`),
          ]),
        },
      }),
      { className: "skills-list" }
    ),
  },
};