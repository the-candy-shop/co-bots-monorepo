import { contract } from "@/services/contract.service";
import { saturate } from "tailwindcss/defaultTheme";
export default {
  namespaced: true,
  state: () => ({
    drawCount: 0,
    winners: [],
    winningBots: {},
    mainWinnersCount: 0,
    bonusWinnersCount: 0,
  }),
  mutations: {
    SET_DRAW_COUNT(state, count) {
      state.drawCount = count;
    },
    SET_WINNERS(state, winners) {
      state.winners = winners;
    },
    SET_MAIN_WINNERS_COUNT(state, count) {
      state.mainWinnersCount = count;
    },
    SET_BONUS_WINNERS_COUNT(state, count) {
      state.bonusWinnersCount = count;
    },
    SET_WINNING_BOT_BY_INDEX(state, { image, index }) {
      state.winningBots[index] = image;
    },
  },
  actions: {
    async getRaffleInfo({ commit }) {
      let count = await contract.MAIN_RAFFLE_WINNERS_COUNT();
      commit("SET_MAIN_WINNERS_COUNT", count);

      let bonusCount = await contract.COORDINATION_RAFFLE_WINNERS_COUNT();
      commit("SET_BONUS_WINNERS_COUNT", bonusCount);
    },
    async getDrawCount({ commit, dispatch }) {
      let drawCount = await contract.drawCount();
      commit("SET_DRAW_COUNT", drawCount);
      dispatch("getWinners");
    },
    async getWinners({ commit, state }) {
      let arr = [...Array(state.drawCount).keys()];
      const winners = await Promise.all(
        arr.map(async (i) => {
          const [address, tokenId] = await contract.winners(i);
          return { idx: i, address, tokenId };
        })
      );
      commit("SET_WINNERS", winners);
    },
    async getBotForTokenIndex({ commit }, index) {
      const tokenURI = await contract.tokenURI(index);
      const { image_data } = JSON.parse(
        tokenURI.split("data:application/json,")[1]
      );
      commit("SET_WINNING_BOT_BY_INDEX", { image: image_data, index });
    },
  },
  getters: {
    drawCount(state) {
      return state.drawCount;
    },
    mainDrawCount(state) {
      return state.drawCount < state.mainWinnersCount
        ? state.drawCount
        : state.mainWinnersCount;
    },
    bonusDrawCount(state) {
      let val = state.drawCount - state.mainWinnersCount;
      return val > 0 ? val : 0;
    },
    mainWinnersCount(state) {
      return state.mainWinnersCount;
    },
    bonusWinnersCount(state) {
      return state.bonusWinnersCount;
    },
    mainWinners(state, getters) {
      return state.winners.slice(0, getters.mainDrawCount);
    },
    mainWinnerByIndex: (state, getters) => (index) => {
      if (state.drawCount - 1 > index) {
        return getters.mainWinners[index];
      }
      return null;
    },
    bonusWinners(state, getters) {
      return state.winners.slice(getters.mainWinnersCount, getters.drawCount);
    },
    bonusWinnersByIndex: (state, getters) => (index) => {
      if (state.drawCount - 1 > index) {
        return getters.bonusWinners[index];
      }
      return null;
    },
    botByTokenIndex: (state) => (index) => {
      return state.winningBots[index];
    },
  },
};
