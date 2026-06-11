import { SKILLS } from "../data/skillsData.js";
import { xpToNext } from "../game/skills.js";

export function renderSkills(game) {
  const container = document.getElementById("skills-box");
  if (!container) return;

  container.innerHTML = "";

  const skills = game.skills || {};

  for (const skillId in SKILLS) {
    const skill = SKILLS[skillId];
    const state = game.skills[skillId] || { level: 0, xp: 0 };

    if (state.level < 1 && state.xp < xpToNext(state.level) / 2) continue;

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
    )
      continue;

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
      bar = entry.querySelector(".skill-bar");
      fill = entry.querySelector(".skill-bar-fill");
    }

    const max = xpToNext(state.level);
    const pct = max > 0 ? Math.min(100, (state.xp / max) * 100) : 0;

    info.innerText = `${skill.name}: ${state.level}`;
    //info.innerText = `${skill.name}: ${state.level}, ${Math.round(state.xp)}/${max}`;
    fill.style.width = `${pct}%`;
  }
}
