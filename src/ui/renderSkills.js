import { byTag, nameOf } from "../utils/tagIndex.js";

function xpToNext(level) {
  const scalingFactor = 100;
  return Math.floor(scalingFactor * Math.pow(2, level / 5));
}

const HIDDEN_ATTRIBUTE_IDS = new Set([
  "constitution", "strength", 
  "agility", "wit",
  "intelligence", "willpower",
]);

export function renderSkills(game) {
  const container = document.getElementById("skills-box");
  if (!container) return;

  for (const skillId of byTag("skills")) {
    if (HIDDEN_ATTRIBUTE_IDS.has(skillId)) continue;

    const progression = game.registry.get(skillId, "LevelHolder");
    if (!progression) continue;

    const level = progression.level;
    const curXp = progression.xp;

    if (level < 1 && curXp < xpToNext(level) / 2) continue;

    let entry = container.querySelector(`[data-skill="${skillId}"]`);
    let info, bar, fill;

    if (!entry) {
      entry = document.createElement("div");
      entry.className = "skill-entry";
      entry.dataset.skill = skillId;

      info = document.createElement("div");
      info.className = "skill-info";

      bar = document.createElement("div");
      bar.className = "skill-bar";

      fill = document.createElement("div");
      fill.className = "skill-bar-fill";

      bar.appendChild(fill);
      entry.appendChild(info);
      entry.appendChild(bar);
      container.appendChild(entry);
    } else {
      info = entry.querySelector(".skill-info");
      fill = entry.querySelector(".skill-bar-fill");
    }

    const max = xpToNext(level);
    const pct = max > 0 ? Math.min(100, (curXp / max) * 100) : 0;

    info.innerText = `${nameOf(skillId)}: ${level}`;
    fill.style.width = `${pct}%`;
  }
}