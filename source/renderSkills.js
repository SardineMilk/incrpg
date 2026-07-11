import { SKILLS } from "../data/skillsData.js";

function xpToNext(level) {
  const scalingFactor = 100;
  return Math.floor(scalingFactor * Math.pow(2, level / 5));
}


export function renderSkills(game) {
  const container = document.getElementById("skills-box");
  if (!container) return;

  container.innerHTML = "";

  for (const skillId in SKILLS) {
    const skill = SKILLS[skillId];

    const progression = game.registry.get(
      skillId,
      "ProgressionHolder"
    );

    const level = progression.level;
    const curXp = progression.xp;

    if (level < 1 && curXp < xpToNext(level) / 2) continue;

    if (
      [
        "strength",
        "constitution",
        "agility",
        "dexterity",
        "intelligence",
        "willpower",
        "wit",
        "perception",
      ].includes(skillId)
    ) {
      continue;
    }

    let entry = container.querySelector(
      `[data-skill="${skillId}"]`
    );

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
      bar = entry.querySelector(".skill-bar");
      fill = entry.querySelector(".skill-bar-fill");
    }

    const max = xpToNext(level);
    const pct = max > 0
      ? Math.min(100, (curXp / max) * 100)
      : 0;

    info.innerText = `${skill.name}: ${level}`;
    fill.style.width = `${pct}%`;
  }
}