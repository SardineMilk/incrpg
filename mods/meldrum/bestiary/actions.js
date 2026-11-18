import { eff, fml, target } from "../../../api/index.js";

const hit = (stat, amount, flags) =>
  eff.onTarget(target.random(target.enemies()), eff.changeValue(stat, amount), { isAttack: true, ...flags });

const foeAttack = (name, form, duration, damage, flags = {}) => ({
  name, duration,
  requirements: fml.active(form),
  result: [hit("health", -damage, { damageType: "physical", melee: true, ...flags })],
});

export const ENEMY_ACTIONS = {
  rat_bite:         foeAttack("Bite",  "rat", 5,  6,  { damageType: "pierce" }),
  matriarch_gnaw:   foeAttack("Gnaw",  "rat_matriarch", 8,  11, { damageType: "pierce" }),
  crab_pinch:       foeAttack("Pinch", "rock_crab", 12, 12, { damageType: "pierce" }),
  boar_gore:        foeAttack("Gore",  "wild_boar", 15, 22, { damageType: "slash" }),
};
