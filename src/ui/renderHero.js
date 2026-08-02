export function renderHero(game) {
  // TODO use formulas
  document.getElementById("health-bar").innerText =
    `HP ${Math.floor(game.values.health)}/${game.values.healthMax}`;

  document.getElementById("stamina-bar").innerText =
    `SP ${Math.floor(game.values.stamina)}/${game.values.staminaMax}`;

  document.getElementById("mental-bar").innerText =
    `MP ${Math.floor(game.values.mental)}/${game.values.mentalMax}`;

  renderStats(game);
}

function renderStats(game) {
  const box = document.getElementById("stats-box");

  box.innerHTML = "";

  const attributes = [
    "constitution", "strength",
    "agility", "wit",
    "intelligence", "willpower",
  ];
  for (const attrId of attributes) {
    const div = document.createElement("div");

    div.className = "attribute-box";

    div.innerText = `${capitalize(attrId)}: ${game.registry.get(attrId, 'LevelHolder').level}`;

    box.appendChild(div);
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
