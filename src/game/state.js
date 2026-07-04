// This should be constructed from save data
export const game = {
  tick: 0,
  conditionStates: {},

  quests: {},

  location: "village_1",

  activeAction: "sleep",

  actions: {
    jogging: {
      progress: 0,
      completions: 0,
      competency: 1,
    },
  },



  values: {
    health: 0,
    stamina: 0,
    mental: 0,
    healthMax: 0,
    staminaMax: 0,
    mentalMax: 0,
  },

};
