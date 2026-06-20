// This should be constructed from save data
export const game = {
  tick: 0,

  resources: {
    health: {
      current: 100,
      max: 100,
      multiplier: 1, // TODO use this
    },

    stamina: {
      current: 100,
      max: 100,
      multiplier: 1,
    },

    mental: {
      current: 100,
      max: 100,
      multiplier: 1,
    },
  },

  activeConditions: {
    health_regen: {},
    stamina_regen: {},
    mental_regen: {},
    death: {},
    parent_xp: {},
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

  flags: {
    checkDifficulty: {
      value: 0,
      flat: 0,
      multiplier: 1,
    },

    activityProgress: 0,
  
  },

  values: {
    health: 100,
    stamina: 100,
    mental: 100,
  },
  attributes: {},
};
