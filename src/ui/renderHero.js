export function renderHero(game) {
  document.getElementById("health-bar").innerText =
    `HP ${Math.floor(game.values.health)}/${game.attributes.healthMax.value}`;

  document.getElementById("stamina-bar").innerText =
    `SP ${Math.floor(game.values.stamina)}/${game.attributes.staminaMax.value}`;

  document.getElementById("mental-bar").innerText =
    `MP ${Math.floor(game.values.mental)}/${game.attributes.mentalMax.value}`;

  /*
  document.getElementById("money-box").innerText =
    `${game.resources.gold} gold`;
  */
  renderStats(game);
}

function renderStats(game) {
  const box = document.getElementById("stats-box");

  box.innerHTML = "";

  const attributes = [
    "strength",
    "constitution",
    "agility",
    "dexterity",
    "intelligence",
    "willpower",
    "wit",
    "perception",
  ];
  for (const attrId of attributes) {
    const div = document.createElement("div");

    div.className = "attribute-box";

    div.innerText = `${capitalize(attrId)}: ${game.skills[attrId].level}`;

    box.appendChild(div);
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
