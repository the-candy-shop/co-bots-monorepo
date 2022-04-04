import { contract } from "@/services/contract.service";
export default {
  namespaced: true,
  state: () => ({
    numBlue: null,
    coordinationThreshold: null,
    maxSupply: null,
  }),
  mutations: {
    SET_NUM_BLUE(state, num) {
      state.numBlue = num;
    },
    SET_COORDINATION_THRESHOLD(state, threshold) {
      state.coordinationThreshold = threshold;
    },
    SET_MAX_SUPPLY(state, supply) {
      state.maxSupply = supply;
    },
  },
  actions: {
    async getBonusRaffleData({ commit }) {
      let coordinationThreshold =
        await contract.COORDINATION_RAFFLE_THRESHOLD();
      commit("SET_COORDINATION_THRESHOLD", coordinationThreshold);

      let maxSupply = await contract.MAX_COBOTS();
      commit("SET_MAX_SUPPLY", maxSupply);
    },
    async getNumBlue({ commit }) {
      let numBlue = await contract.coBotsColorAgreement();
      commit("SET_NUM_BLUE", numBlue);
    },
  },
  getters: {
    //NOTE: numBlue and numRed are swapped to account for an error in the contract.
    numBlue(state) {
      if (state.numBlue === null || state.maxSupply === null) return 0;
      return state.maxSupply - state.numBlue;
    },
    numRed(state) {
      if (state.numBlue === null || state.maxSupply === null) return 0;
      return state.numBlue;
    },
    coordinationThreshold(state) {
      return state.coordinationThreshold;
    },
  },
};
