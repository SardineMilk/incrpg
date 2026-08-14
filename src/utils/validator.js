import { EFFECT_DEFS } from "../structures/effectDefs.js";
import { REQUIREMENT_DEFS } from "../structures/requirementDefs.js";
import { TRIGGER_DEFS } from "../structures/triggerDefs.js";

const REGISTRIES = { effect: EFFECT_DEFS, requirement: REQUIREMENT_DEFS, trigger: TRIGGER_DEFS };

const EFFECT_LIST_FIELDS = new Set(["effects", "result", "level", "success", "failure"]);
const MILESTONE_FIELD = "milestones";
const REQUIREMENT_LIST_FIELD = "requirements";
const TRIGGER_LIST_FIELDS = new Set(["triggers"]);

export function validate(conditions, skills, actions, locations = {}) {
  console.log("Static Validation: ");
  const errors = [];
  const warnings = [];

  const namespaces = { conditions, skills, actions, locations };

  console.log("- checking for duplicate ids");
  checkDuplicateIds(namespaces, errors);

  console.log("- checking for unknown effect/requirement/trigger types");
  checkKnownTypes(namespaces, errors, warnings);

  //console.log("- checking for misused effects");
  // TODO - use checkReactiveEffectSupport

  // TODO - orphan tags
  // Tags that are referenced but not existent in the data
  // To mitigate misspelling causing silent errors
  // Must exclude namespace tags

  // TODO - orphan ids

  if (warnings.length > 0) {
    console.warn(`Content validation: ${warnings.length} warning(s):\n` +
      warnings.map(w => `  - ${w}`).join("\n"));
  }

  if (errors.length > 0) {
    const report = errors.map(e => `  - ${e}`).join("\n");
    console.warn(`Content validation: ${errors.length} error(s):\n${report}`);
  }

  return errors;
}

function checkDuplicateIds(collections, errors) {
  const seenIn = new Map();
  for (const [collectionId, collection] of Object.entries(collections)) {
    for (const id in collection) {
      const existing = seenIn.get(id);
      if (existing) {
        errors.push(`duplicate id "${id}" (seen in "${existing}" and "${collectionId}")`);
        continue;
      }
      seenIn.set(id, collectionId);
    }
  }
}

function checkReactiveEffectSupport(skillId, listName, effects, errors) {
  for (const effect of effects) {
    const def = EFFECT_DEFS[effect.type];
    if (!def) continue; // unknown-type already caught elsewhere
    if (!def.scale) errors.push(`${skillId}.${listName}: effect "${effect.type}" has no scale() — level-scaling will silently no-op`);
    if (!def.diff)  errors.push(`${skillId}.${listName}: effect "${effect.type}" has no diff() — will fall back to remove+reapply every reconciliation`);
  }
}

function checkKnownTypes(namespaces, errors, warnings) {
  for (const [namespaceId, dataset] of Object.entries(namespaces)) {
    for (const [entityId, def] of Object.entries(dataset)) {
      walkEntity(`${namespaceId}.${entityId}`, def, errors, warnings);
    }
  }
}

function walkEntity(path, def, errors, warnings) {
  if (!def || typeof def !== "object") return;

  for (const [key, value] of Object.entries(def)) {
    if (EFFECT_LIST_FIELDS.has(key)) {
      walkTypedList(`${path}.${key}`, value, "effect", errors, warnings);
    } else if (key === MILESTONE_FIELD && value && typeof value === "object") {
      for (const [level, effects] of Object.entries(value)) {
        walkTypedList(`${path}.milestones[${level}]`, effects, "effect", errors, warnings);
      }
    } else if (key === REQUIREMENT_LIST_FIELD) {
      walkTypedList(`${path}.requirements`, value, "requirement", errors, warnings);
    } else if (TRIGGER_LIST_FIELDS.has(key) && Array.isArray(value)) {
      value.forEach((entry, i) => walkTriggerEntry(`${path}.${key}[${i}]`, entry, errors, warnings));
    }
  }
}

function walkTriggerEntry(path, entry, errors, warnings) {
  if (!entry || typeof entry !== "object") return;
  if (entry.event) checkType(`${path}.event`, entry.event, "trigger", errors, warnings);
  if (entry.requirements) walkTypedList(`${path}.requirements`, entry.requirements, "requirement", errors, warnings);
  if (entry.effects) walkTypedList(`${path}.effects`, entry.effects, "effect", errors, warnings);
}

function walkTypedList(path, value, kind, errors, warnings) {
  if (!Array.isArray(value)) return;
  value.forEach((item, i) => {
    if (Array.isArray(item)) {
      walkTypedList(`${path}[${i}]`, item, kind, errors, warnings);
    } else {
      checkType(`${path}[${i}]`, item, kind, errors, warnings);
    }
  });
}

function checkType(path, value, kind, errors, warnings) {
  if (!value || typeof value !== "object" || typeof value.type !== "string") return;

  const registry = REGISTRIES[kind];
  const entry = registry[value.type];

  if (!entry) {
    errors.push(`${path}: unknown ${kind} type "${value.type}"`);
    return;
  }

  if (entry.deprecated) {
    warnings.push(`${path}: uses deprecated ${kind} "${value.type}" - ${entry.deprecated}`);
  }

  walkEntity(path, value, errors, warnings);
}
