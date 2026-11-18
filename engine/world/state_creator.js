import { NAMESPACES } from "../loader/registry.js";

import { CompletionHolder } from "../components/completionHolder.js";
import { LevelHolder } from "../components/levelHolder.js";
import { ModifierHolder } from "../components/modifierHolder.js";
import { PassiveHolder } from "../components/passiveHolder.js";
import { StatLayer } from "../components/statLayer.js";
import { TriggerHolder } from "../components/triggerHolder.js";
import { RequirementHolder, DormantHolder, VisibilityHolder } from "../components/requirementHolder.js";


import { generateTagIndex } from "../util/tagIndex.js";
import { Reactor } from "../core/reactor.js";

import { validate } from "../loader/validator.js";
import { ContextStack } from "../core/context.js";
import { CandidateScope } from "../core/candidateScope.js";
import { EntityRegistry, registerEntities } from "../core/entityRegistry.js";
import { spawnActor, despawnActor } from "./actor.js";
import { applyEffect } from "../core/effects.js";


/*
* Some entities in the game might cause infinite loops
* Examples:
* - evt.valueGain("foo") -> eff.changeValue("foo", 1)
* - eff.changeValue("healthMax", fml.value("healthMax"))
* This will often be a long chain of multiple interacting entities
* To combat this, the effect stack has a depth limit
* Past this depth, the stack will stop accepting new context
* Instead, it will gracefully resolve the existing stack
* Increase this number to make infinite loops last longer before being resolved
* Decrease for better performance in the case of infinite loops
* If it is too low, normal game operation may be impacted 
*/
const MAX_STACK_DEPTH = 64;

// ooh yeah, mulberry32
// these evasion rolls are uncrackable!
export function rngFactory(seed) {
  let state = seed >>> 0;
  const rng = () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  rng.getSeed = () => state;
  rng.setSeed = (s) => { state = s >>> 0; };
  return rng;
}

export function buildTemplateRegistry() {
  const registry = new EntityRegistry();

  registerEntities(registry, NAMESPACES.skills, [
    LevelHolder
  ]);
  registerEntities(registry, NAMESPACES.actions, [
    PassiveHolder, TriggerHolder, ModifierHolder, CompletionHolder,
    RequirementHolder, DormantHolder, VisibilityHolder,
  ]);
  registerEntities(registry, NAMESPACES.activities, [
    PassiveHolder, TriggerHolder, ModifierHolder, CompletionHolder,
    RequirementHolder, DormantHolder, VisibilityHolder,
  ]);
  registerEntities(registry, NAMESPACES.conditions, [
    PassiveHolder, TriggerHolder, ModifierHolder, StatLayer, CompletionHolder,
    RequirementHolder, DormantHolder, VisibilityHolder,
  ]);
  registerEntities(registry, NAMESPACES.locations, [
    PassiveHolder, TriggerHolder,
    RequirementHolder, DormantHolder, VisibilityHolder,
  ]);

  return registry;
}

export function initialiseWorld(seed) {
  const world = {};
  world.context = new ContextStack(MAX_STACK_DEPTH);
  world.candidateScope = new CandidateScope();
  world.reactor = new Reactor(MAX_STACK_DEPTH);
  world.rng = rngFactory(seed);
  world.actors = new Map();
  world.spawn = spawnActor;
  world.despawn = despawnActor;
  world.applyEffect = applyEffect; // Evil dependency fuckery

  for (const [namespace, dataset] of Object.entries(NAMESPACES)) {
    for (const id in dataset) {
      const dedupTags = 
      dataset[id].tags = [...new Set([...(dataset[id].tags ?? []), namespace])];
    }
  }

  validate(NAMESPACES.conditions, NAMESPACES.skills, NAMESPACES.actions);

  for (const dataset of Object.values(NAMESPACES)) {
    generateTagIndex(dataset);
  }


  world.templateRegistry = buildTemplateRegistry();

  return world;
}


