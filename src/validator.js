/**
 * validate.js — Static analysis for game data structures.
 *
 * Place alongside the project source files (same directory as skillsData.js etc.)
 * Run: node validate.js   (Node ≥ 18, project must use ES modules)
 *
 * Checks
 * ───────
 *  • Every effect / requirement / trigger type exists in its definition registry
 *  • Cross-references: skills, conditions, actions, locations all resolve to real IDs
 *  • Skill parents exist and form no cycles
 *  • Actions reference only known skills and attributes
 *  • skillLevelBonus multiplier ≠ 0  (defaults to 0 in create() — zeroes out levels)
 *  • Required fields present on every structure
 *  • Milestone keys are numeric and ascending
 *  • ADVERSARY_ACTIONS adversary_action references exist
 *  • NPC location references exist
 */

// ─── Reporter ─────────────────────────────────────────────────────────────────

class Reporter {
  constructor() {
    this.errors   = [];
    this.warnings = [];
    this._path    = [];
    this._counts  = { datasets: 0, structures: 0 };
  }

  enter(label) { this._path.push(String(label)); }
  exit()       { this._path.pop(); }

  at(label, fn) {
    this.enter(label);
    try { fn(); } finally { this.exit(); }
  }

  error(msg) {
    this.errors.push(`  [${this._path.join(' › ')}]\n     ${msg}`);
  }
  warn(msg) {
    this.warnings.push(`    [${this._path.join(' › ')}]\n     ${msg}`);
  }

  section(name) {
    console.log(`\n── ${name} ${'─'.repeat(Math.max(0, 54 - name.length))}`);
    this._counts.datasets++;
  }

  report() {
    const e = this.errors.length;
    const w = this.warnings.length;

    console.log('\n' + '═'.repeat(58));
    console.log(' Validation Report');
    console.log('═'.repeat(58));

    if (e === 0 && w === 0) {
      console.log('\nAll checks passed\n');
      return;
    }

    if (e > 0) {
      console.log(`\nERRORS (${e})\n`);
      this.errors.forEach(msg => console.log(msg));
    }
    if (w > 0) {
      console.log(`\nWARNINGS (${w})\n`);
      this.warnings.forEach(msg => console.log(msg));
    }

    console.log('\n' + '─'.repeat(58));
    console.log(` ${e} error(s)   ${w} warning(s)`);
    console.log('─'.repeat(58) + '\n');

  }
}

// ─── Safe dynamic imports ──────────────────────────────────────────────────────

async function tryLoad(r, specifier, label) {
  try {
    const mod = await import(specifier);
    console.log(`Loaded  ${label}`);
    return mod;
  } catch (err) {
    r.error(`Could not import ${label} (${specifier}):\n     ${err.message}`);
    return null;
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

const r = new Reporter();

console.log('\nLoading modules…\n');

const [
  skillsMod, condsMod,  actionsMod, locationsMod,
  npcsMod,   effDefsMod, reqDefsMod, trgDefsMod,  selDefsMod,
] = await Promise.all([
  tryLoad(r, './data/skillsData.js',      'skillsData'),
  tryLoad(r, './data/conditionsData.js',  'conditionsData'),
  tryLoad(r, './data/actionsData.js',     'actionsData'),
  tryLoad(r, './data/locationsData.js',   'locationsData'),
  tryLoad(r, './data/entityData.js',      'entityData'),
  tryLoad(r, './structures/effectDefs.js',      'effectDefs'),
  tryLoad(r, './structures/requirementDefs.js', 'requirementDefs'),
  tryLoad(r, './structures/triggerDefs.js',     'triggerDefs'),
  tryLoad(r, './structures/selectorDefs.js',    'selectorDefs'),
]);

// Optional datasets — failure is a warning, not fatal
const activMod = await tryLoad(r, './data/activitiesData.js', 'activitiesData (optional)');
const diagMod  = await tryLoad(r, './data/dialogueData.js',   'dialogueData   (optional)');

// Abort if any core module failed
if (!skillsMod || !condsMod || !actionsMod || !locationsMod ||
    !effDefsMod || !reqDefsMod || !trgDefsMod || !selDefsMod) {
  r.report();
}

// Unwrap exports
const { SKILLS }                       = skillsMod;
const { CONDITIONS }                   = condsMod;
const { ACTIONS, ADVERSARY_ACTIONS }   = actionsMod;
const { LOCATIONS }                    = locationsMod;
const { NPCS }                         = npcsMod ?? { NPCS: {} };
const { EFFECT_DEFS }                  = effDefsMod;
const { REQUIREMENT_DEFS }             = reqDefsMod;
const { TRIGGER_DEFS }                 = trgDefsMod;
const { isSelector }                   = selDefsMod;
const { ACTIVITIES }                   = activMod  ?? { ACTIVITIES: {} };
const { DIALOGUES }                    = diagMod   ?? { DIALOGUES: {} };

// ─── Canonical ID sets ────────────────────────────────────────────────────────

const SKILL_IDS     = new Set(Object.keys(SKILLS));
const CONDITION_IDS = new Set(Object.keys(CONDITIONS));
const ACTION_IDS    = new Set([
  ...Object.keys(ACTIONS ?? {}),
  ...Object.keys(ADVERSARY_ACTIONS ?? {}),
]);
const LOCATION_IDS  = new Set(Object.keys(LOCATIONS));
const EFFECT_TYPES  = new Set(Object.keys(EFFECT_DEFS));
const REQ_TYPES     = new Set(Object.keys(REQUIREMENT_DEFS));
const TRIGGER_TYPES = new Set(Object.keys(TRIGGER_DEFS));
const DIALOGUE_IDS  = new Set(Object.keys(DIALOGUES ?? {}));

// Game values and attributes are open-ended (added dynamically via effects),
// so unknowns are warnings only. Seed these from the initial game state.
const KNOWN_VALUES = new Set([
  'health', 'stamina', 'mental', 'check_difficulty',
  // Intermediate computation values used in INHERENT_EFFECTS:
  'healthRegenAmount', 'staminaRegenAmount', 'mentalRegenAmount',
]);
const KNOWN_ATTRIBUTES = new Set(['healthMax', 'staminaMax', 'mentalMax']);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** True when val is a plain primitive / object we can inspect at analysis time. */
const isFormula  = val => typeof val === 'function' && !isSelector(val);
const isRuntime  = val => val == null || isFormula(val) || isSelector(val);
const isAnalysable = val => !isRuntime(val);

// ─── Per-type validators: Effects ─────────────────────────────────────────────

const EFFECT_FIELD_CHECKS = {
  grantSkillXp(r, e) {
    if (isAnalysable(e.skill) && !SKILL_IDS.has(e.skill))
      r.error(`Unknown skill: "${e.skill}"`);
    if (isAnalysable(e.amount) && typeof e.amount !== 'number')
      r.warn(`'amount' should be a number, got ${typeof e.amount}`);
  },

  skillXpMultiplier(r, e) {
    if (isAnalysable(e.skill) && !SKILL_IDS.has(e.skill))
      r.error(`Unknown skill: "${e.skill}"`);
    if (isAnalysable(e.amount) && e.amount <= 0)
      r.warn(`'amount' is ${e.amount} — XP multiplier should be positive`);
  },

  skillLevelBonus(r, e) {
    if (isAnalysable(e.skill) && !SKILL_IDS.has(e.skill))
      r.error(`Unknown skill: "${e.skill}"`);

    // KNOWN BUG: effectDefs.js skillLevelBonus.create has `multiplier = 0` as default.
    // apply() does `s.bonus.multiplier *= e.multiplier`, so passing 0 zeroes the
    // entire multiplier for that skill this tick (any skill that was previously
    // boosted or has multiple callers will end up with level 0).
    // The default should be 1 (multiplicative identity).
    if (isAnalysable(e.multiplier) && e.multiplier === 0)
      r.warn(
        'multiplier is 0 — this will zero out skill.bonus.multiplier for the whole tick.\n' +
        '     The default in EFFECT_DEFS.skillLevelBonus.create should be 1, not 0.\n' +
        '     apply() does: s.bonus.multiplier *= e.multiplier  ← *= 0 destroys it.'
      );
  },

  changeConditionStrength(r, e) {
    if (isAnalysable(e.condition) && !CONDITION_IDS.has(e.condition))
      r.error(`Unknown condition: "${e.condition}"`);
  },

  applyCondition(r, e) {
    if (isAnalysable(e.condition) && !CONDITION_IDS.has(e.condition))
      r.error(`Unknown condition: "${e.condition}"`);
  },

  changeAttribute(r, e) {
    if (isAnalysable(e.attribute) && !KNOWN_ATTRIBUTES.has(e.attribute))
      r.warn(`Unrecognised attribute "${e.attribute}" — add to KNOWN_ATTRIBUTES in validate.js if intentional`);
  },

  setAttribute(r, e) {
    if (isAnalysable(e.attribute) && !KNOWN_ATTRIBUTES.has(e.attribute))
      r.warn(`Unrecognised attribute "${e.attribute}"`);
  },

  removeAttribute(r, e) {
    if (isAnalysable(e.attribute) && !KNOWN_ATTRIBUTES.has(e.attribute))
      r.warn(`removeAttribute targets unrecognised attribute "${e.attribute}"`);
  },

  setActiveAction(r, e) {
    if (e.action !== null && isAnalysable(e.action) && !ACTION_IDS.has(e.action))
      r.error(`Unknown action: "${e.action}"`);
  },

  setLocation(r, e) {
    if (isAnalysable(e.location) && !LOCATION_IDS.has(e.location))
      r.error(`Unknown location: "${e.location}"`);
  },

  changeValue(r, e) {
    if (isAnalysable(e.value) && !KNOWN_VALUES.has(e.value))
      r.warn(`Unrecognised game value "${e.value}" — add to KNOWN_VALUES in validate.js if intentional`);
  },

  setValue(r, e) {
    if (isAnalysable(e.value) && !KNOWN_VALUES.has(e.value))
      r.warn(`Unrecognised game value "${e.value}"`);
  },

  removeValue(r, e) {
    if (isAnalysable(e.value) && !KNOWN_VALUES.has(e.value))
      r.warn(`removeValue targets unrecognised game value "${e.value}"`);
  },

  activityProgress(r, e) {
    if (isAnalysable(e.amount) && typeof e.amount !== 'number')
      r.warn(`'amount' should be a number, got ${typeof e.amount}`);
  },

  sendMessage(r, e) {
    if (isAnalysable(e.category) && typeof e.category !== 'string')
      r.warn(`'category' should be a string`);
    if (isAnalysable(e.message)  && typeof e.message  !== 'string')
      r.warn(`'message' should be a string`);
  },
};

// ─── Per-type validators: Requirements ────────────────────────────────────────

const REQ_FIELD_CHECKS = {
  hasCondition(r, req) {
    if (isAnalysable(req.condition) && !CONDITION_IDS.has(req.condition))
      r.error(`Unknown condition: "${req.condition}"`);
  },
  hasNotCondition(r, req) {
    if (isAnalysable(req.condition) && !CONDITION_IDS.has(req.condition))
      r.error(`Unknown condition: "${req.condition}"`);
  },
  skillMoreThan(r, req) {
    if (isAnalysable(req.skill) && !SKILL_IDS.has(req.skill))
      r.error(`Unknown skill: "${req.skill}"`);
  },
  skillBaseMoreThan(r, req) {
    if (isAnalysable(req.skill) && !SKILL_IDS.has(req.skill))
      r.error(`Unknown skill: "${req.skill}"`);
  },
  valueLessThan(r, req) {
    if (isAnalysable(req.value) && !KNOWN_VALUES.has(req.value))
      r.warn(`Unrecognised game value "${req.value}"`);
  },
  flagSet(r, req) {
    if (isAnalysable(req.flag) && typeof req.flag !== 'string')
      r.warn(`flagSet 'flag' should be a string`);
  },
};

// ─── Per-type validators: Triggers ────────────────────────────────────────────

const TRIGGER_FIELD_CHECKS = {
  gainSkillXp(r, t) {
    if (isAnalysable(t.skill) && t.skill != null && !SKILL_IDS.has(t.skill))
      r.error(`Unknown skill: "${t.skill}"`);
  },
  conditionApplied(r, t) {
    if (isAnalysable(t.condition) && !CONDITION_IDS.has(t.condition))
      r.error(`Unknown condition: "${t.condition}"`);
  },
  valueGain(r, t) {
    if (isAnalysable(t.value) && !KNOWN_VALUES.has(t.value))
      r.warn(`Unrecognised game value "${t.value}"`);
  },
  valueLoss(r, t) {
    if (isAnalysable(t.value) && !KNOWN_VALUES.has(t.value))
      r.warn(`Unrecognised game value "${t.value}"`);
  },
};

// ─── Core walk functions ──────────────────────────────────────────────────────

function validateEffect(r, effect) {
  if (!effect || typeof effect !== 'object') {
    r.error(`Expected an effect object, got ${typeof effect}: ${JSON.stringify(effect)}`);
    return;
  }
  if (!effect.type) {
    r.error(`Effect is missing 'type' field: ${JSON.stringify(effect)}`);
    return;
  }
  if (!EFFECT_TYPES.has(effect.type)) {
    r.error(`Unknown effect type: "${effect.type}"`);
    return;
  }
  r.at(effect.type, () => {
    EFFECT_FIELD_CHECKS[effect.type]?.(r, effect);
  });
}

function validateRequirement(r, req) {
  // Nested array = OR group (outer array = AND group, handled by caller)
  if (Array.isArray(req)) {
    req.forEach((item, i) =>
      r.at(`OR[${i}]`, () => validateRequirement(r, item))
    );
    return;
  }
  if (!req || typeof req !== 'object') {
    r.error(`Expected a requirement object, got ${typeof req}: ${JSON.stringify(req)}`);
    return;
  }
  if (!req.type) {
    r.error(`Requirement is missing 'type' field`);
    return;
  }
  if (!REQ_TYPES.has(req.type)) {
    r.error(`Unknown requirement type: "${req.type}"`);
    return;
  }
  r.at(req.type, () => {
    REQ_FIELD_CHECKS[req.type]?.(r, req);
  });
}

function validateTrigger(r, trigger) {
  if (!trigger || typeof trigger !== 'object') {
    r.error(`Expected a trigger object, got ${typeof trigger}`);
    return;
  }
  if (!trigger.type) {
    r.error(`Trigger is missing 'type' field`);
    return;
  }
  if (!TRIGGER_TYPES.has(trigger.type)) {
    r.error(`Unknown trigger type: "${trigger.type}"`);
    return;
  }
  r.at(trigger.type, () => {
    TRIGGER_FIELD_CHECKS[trigger.type]?.(r, trigger);
  });
}

function validateEffects(r, effects, label = 'effects') {
  if (!Array.isArray(effects)) {
    r.error(`'${label}' must be an array, got ${typeof effects}`);
    return;
  }
  effects.forEach((e, i) =>
    r.at(`${label}[${i}]`, () => validateEffect(r, e))
  );
}

function validateRequirements(r, reqs, label = 'requirements') {
  if (!Array.isArray(reqs)) {
    r.error(`'${label}' must be an array, got ${typeof reqs}`);
    return;
  }
  reqs.forEach((req, i) =>
    r.at(`${label}[${i}]`, () => validateRequirement(r, req))
  );
}

// ─── Dataset validators ───────────────────────────────────────────────────────

function validateSkills(r, skills) {
  r.section('SKILLS');
  r.at('SKILLS', () => {
    // Detect parent cycles before checking individual skills
    for (const startId of Object.keys(skills)) {
      const visited = new Set();
      let cur = startId;
      while (cur != null) {
        if (visited.has(cur)) {
          r.at(startId, () =>
            r.error(`Cycle in parent chain: ${[...visited].join(' → ')} → ${cur}`)
          );
          break;
        }
        visited.add(cur);
        cur = skills[cur]?.parent;
      }
    }

    for (const [id, skill] of Object.entries(skills)) {
      r.at(id, () => {
        // Parent reference
        if (skill.parent != null && !SKILL_IDS.has(skill.parent))
          r.error(`parent "${skill.parent}" not found in SKILLS`);

        // Per-level effects
        if (skill.level != null)
          validateEffects(r, skill.level, 'level');

        // Milestones
        if (skill.milestones) {
          const keys   = Object.keys(skill.milestones).map(Number);
          const sorted = [...keys].sort((a, b) => a - b);

          if (JSON.stringify(keys) !== JSON.stringify(sorted))
            r.warn(`Milestone keys are not in ascending order: [${keys.join(', ')}]`);

          for (const [lvl, effects] of Object.entries(skill.milestones)) {
            if (isNaN(Number(lvl)))
              r.error(`Milestone key "${lvl}" is not a number`);
            validateEffects(r, effects, `milestones[${lvl}]`);
          }
        }
      });
    }
  });
}

function validateConditions(r, conditions) {
  r.section('CONDITIONS');
  r.at('CONDITIONS', () => {
    for (const [id, cond] of Object.entries(conditions)) {
      r.at(id, () => {
        if (cond.triggers)
          cond.triggers.forEach((t, i) =>
            r.at(`triggers[${i}]`, () => validateTrigger(r, t))
          );
        if (cond.requirements) validateRequirements(r, cond.requirements);
        if (cond.effects)      validateEffects(r, cond.effects);
      });
    }
  });
}

function validateActions(r, actions, label) {
  r.section(label);
  r.at(label, () => {
    for (const [id, action] of Object.entries(actions ?? {})) {
      r.at(id, () => {
        if (action.duration == null)
          r.error(`Missing required field 'duration'`);
        if (typeof action.name !== 'string')
          r.warn(`Missing or non-string 'name' field`);

        // Skill references
        for (const skillId of Object.keys(action.skills ?? {})) {
          if (!SKILL_IDS.has(skillId))
            r.error(`skills['${skillId}'] — unknown skill ID`);
        }

        // Attribute references (stored as skill IDs in the game model)
        for (const attrId of Object.keys(action.attributes ?? {})) {
          if (!SKILL_IDS.has(attrId))
            r.error(`attributes['${attrId}'] — not found in SKILLS (attributes are tracked as skills)`);
        }

        if (action.requirements) validateRequirements(r, action.requirements);
        if (action.tick)         validateEffects(r, action.tick,   'tick');
        if (action.result)       validateEffects(r, action.result, 'result');

        // Check block (adversary actions)
        if (action.check) {
          if (action.check.difficulty == null)
            r.warn(`check block has no 'difficulty' field`);
          if (action.check.skills) {
            for (const skillId of Object.keys(action.check.skills)) {
              if (!SKILL_IDS.has(skillId))
                r.error(`check.skills['${skillId}'] — unknown skill ID`);
            }
          }
          if (action.check.success)
            validateEffects(r, action.check.success, 'check.success');
          if (action.check.failure)
            validateEffects(r, action.check.failure, 'check.failure');
        }
      });
    }
  });
}

function validateLocations(r, locations) {
  r.section('LOCATIONS');
  r.at('LOCATIONS', () => {
    for (const [id, loc] of Object.entries(locations)) {
      r.at(id, () => {
        if (!loc.name)
          r.error(`Missing 'name' field`);
        if (!Array.isArray(loc.tags))
          r.warn(`Missing or invalid 'tags' array`);
      });
    }
  });
}

function validateNpcs(r, npcs) {
  r.section('NPCS');
  r.at('NPCS', () => {
    for (const [id, npc] of Object.entries(npcs ?? {})) {
      r.at(id, () => {
        if (!npc.name) r.warn(`Missing 'name' field`);
        if (npc.location && !LOCATION_IDS.has(npc.location))
          r.error(`location "${npc.location}" not found in LOCATIONS`);
      });
    }
  });
}

function validateActivities(r, activities) {
  r.section('ACTIVITIES');
  r.at('ACTIVITIES', () => {
    for (const [id, act] of Object.entries(activities ?? {})) {
      r.at(id, () => {
        if (act.duration == null) r.error(`Missing required field 'duration'`);
        if (act.requirements) validateRequirements(r, act.requirements);
        if (act.tick)         validateEffects(r, act.tick,   'tick');
        if (act.result)       validateEffects(r, act.result, 'result');

        // Each adversary_action key must exist in ADVERSARY_ACTIONS
        for (const advId of Object.keys(act.adversary_actions ?? {})) {
          if (!Object.keys(ADVERSARY_ACTIONS ?? {}).includes(advId))
            r.warn(`adversary_actions['${advId}'] not found in ADVERSARY_ACTIONS`);

          const entry = act.adversary_actions[advId];
          if (entry && entry.weight == null)
            r.warn(`adversary_actions['${advId}'] has no 'weight' field`);
        }
      });
    }
  });
}

function validateDialogues(r, dialogues) {
  r.section('DIALOGUES');
  r.at('DIALOGUES', () => {
    for (const [id, dlg] of Object.entries(dialogues ?? {})) {
      r.at(id, () => {
        if (!dlg.result && !dlg.name) {
          r.warn(`Dialogue entry has neither 'name' nor 'result'`);
        }
        if (dlg.result) {
          validateEffects(r, dlg.result, 'result');

          // Validate choice 'action' cross-references inside presentChoice effects
          for (const effect of dlg.result) {
            if (effect?.type === 'presentChoice' && Array.isArray(effect.options)) {
              effect.options.forEach((opt, i) => {
                if (opt.action && !DIALOGUE_IDS.has(opt.action))
                  r.warn(`options[${i}].action "${opt.action}" not found in DIALOGUES`);
                if (opt.result) validateEffects(r, opt.result, `options[${i}].result`);
                if (opt.requirements) validateRequirements(r, opt.requirements);
              });
            }
          }
        }
      });
    }
  });
}

// ─── Cross-dataset integrity checks ──────────────────────────────────────────

function crossDatasetChecks(r) {
  r.section('Cross-dataset checks');
  r.at('cross-dataset', () => {

    // Every action attribute key must also exist as a SKILL (attributes are skills)
    for (const [actionId, action] of Object.entries(ACTIONS ?? {})) {
      for (const attrId of Object.keys(action.attributes ?? {})) {
        if (!SKILL_IDS.has(attrId))
          r.at(`ACTIONS > ${actionId}`, () =>
            r.error(`attributes['${attrId}'] is not in SKILLS`)
          );
      }
    }

    // Every skill used in action.skills must be in SKILLS
    for (const [actionId, action] of Object.entries(ACTIONS ?? {})) {
      for (const skillId of Object.keys(action.skills ?? {})) {
        if (!SKILL_IDS.has(skillId))
          r.at(`ACTIONS > ${actionId}`, () =>
            r.error(`skills['${skillId}'] is not in SKILLS`)
          );
      }
    }
  });
}

// ─── Summary of known IDs (useful for orientation) ───────────────────────────

function printSummary() {
  console.log('\n' + '═'.repeat(58));
  console.log(' Dataset summary');
  console.log('═'.repeat(58));
  console.log(`  Skills         : ${SKILL_IDS.size}`);
  console.log(`  Conditions     : ${CONDITION_IDS.size}`);
  console.log(`  Actions        : ${Object.keys(ACTIONS ?? {}).length}`);
  console.log(`  Adversary acts : ${Object.keys(ADVERSARY_ACTIONS ?? {}).length}`);
  console.log(`  Locations      : ${LOCATION_IDS.size}`);
  console.log(`  NPCs           : ${Object.keys(NPCS ?? {}).length}`);
  console.log(`  Activities     : ${Object.keys(ACTIVITIES ?? {}).length}`);
  console.log(`  Dialogues      : ${DIALOGUE_IDS.size}`);
  console.log(`  Effect types   : ${EFFECT_TYPES.size}`);
  console.log(`  Requirement t. : ${REQ_TYPES.size}`);
  console.log(`  Trigger types  : ${TRIGGER_TYPES.size}`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

export function validate() {
  printSummary();

  validateSkills(r, SKILLS);
  validateConditions(r, CONDITIONS);
  validateActions(r, ACTIONS,           'ACTIONS');
  validateActions(r, ADVERSARY_ACTIONS, 'ADVERSARY_ACTIONS');
  validateLocations(r, LOCATIONS);
  validateNpcs(r, NPCS);
  validateActivities(r, ACTIVITIES);
  validateDialogues(r, DIALOGUES);
  crossDatasetChecks(r);

  r.report();
}