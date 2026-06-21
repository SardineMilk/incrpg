// This should be constructed from save data
export const game = {
  tick: 0,


  activeConditions: {
    health_regen: {},
    stamina_regen: {},
    mental_regen: {},
    death: {},
    parent_xp: {},
    human: {},
  },

  inventory: {
    sword: 1,
  },

  quests: {},

  location: "village_1",

  activeAction: "jog",

  actions: {
    jogging: {
      progress: 0,
      completions: 0,
      competency: 1,
    },
  },



  values: {
    health: 100,
    stamina: 100,
    mental: 100,
  },
  attributes: {
    healthMax: {
      value: 100,
      flat: 100,
      percent: 1,
      multiplier: 1,
    },
    staminaMax: {
      value: 100,
      flat: 100,
      percent: 1,
      multiplier: 1,
    },
    mentalMax: {
      value: 100,
      flat: 100,
      percent: 1,
      multiplier: 1,
    },
  },
};
