import { contract } from "../services/contract.service";

export default {
  namespaced: true,
  state: () => ({
    myBots: [],
    botImages: {},
    botColors: {},
    numMinted: 0,
    flipInProgress: false,
  }),
  mutations: {
    SET_MY_BOTS(state, bots) {
      state.myBots = bots;
    },
    SET_BOT_IMAGES_BY_INDEX(state, { image, index }) {
      state.botImages[index] = image;
    },
    SET_NUM_MINTED(state, num) {
      state.numMinted = num;
    },
    SET_BOT_COLORS(state, { color, index }) {
      state.botColors[index] = color;
    },
    SET_FLIP_IN_PROGRESS(state, inProgress) {
      state.flipInProgress = inProgress;
    },
  },
  actions: {
    async getMyBots({ commit, state }, address) {
      if (!address) return;
      const num = await contract.balanceOf(address);
      let numMinted = num.toNumber();
      commit("SET_NUM_MINTED", numMinted);

      let arr = [...Array(num.toNumber()).keys()];

      const bots = await Promise.all(
        arr.map(async (i) => {
          let ind = await contract.tokenOfOwnerByIndex(address, i);
          return ind.toNumber();
        })
      );

      commit("SET_MY_BOTS", bots);
    },
    async getImageForIndex({ commit }, index) {
      const tokenURI = await contract.tokenURI(index);
      const { image_data } = JSON.parse(
        tokenURI.split("data:application/json,")[1]
      );
      commit("SET_BOT_IMAGES_BY_INDEX", { image: image_data, index });
    },
    async getBotColor({ commit }, index) {
      const isBlue = await contract.coBotsColors(index);
      commit("SET_BOT_COLORS", { index, color: isBlue ? "blue" : "red" });
    },
    async toggleBotColor({ commit, state, dispatch }, index) {
      try {
        if (state.flipInProgress) return;
        commit("SET_FLIP_IN_PROGRESS", true);
        let transaction = await contract.toggleColors([index]);
        await transaction.wait();
        let curColor = state.botColors[index];
        commit("SET_BOT_COLORS", {
          index,
          color: curColor == "red" ? "blue" : "red",
        });
        dispatch("getImageForIndex", index);
      } catch (e) {
        console.log(e.message);
      }
      commit("SET_FLIP_IN_PROGRESS", false);
    },
    async flipAllColors({ commit, state, dispatch }, color) {
      if (color !== "red" && color !== "blue") return;
      if (state.flipInProgress) return;
      try {
        const tokensToFlip = state.myBots.filter(
          (i) => state.botColors[i] != color
        );
        commit("SET_FLIP_IN_PROGRESS", true);
        let transaction = await contract.toggleColors(tokensToFlip);
        await transaction.wait();
        tokensToFlip.forEach((index) => {
          commit("SET_BOT_COLORS", { index, color });
          dispatch("getImageForIndex", index);
        });
      } catch (e) {
        console.log(e.message);
      }
      commit("SET_FLIP_IN_PROGRESS", false);
    },
  },
  getters: {
    myBots(state) {
      return state.myBots;
    },
    hasBots(state) {
      return state.myBots.length > 0;
    },
    imageByIndex: (state) => (idx) => {
      return state.botImages[idx] || null;
    },
    colorByIndex: (state) => (idx) => {
      return state.botColors[idx] || null;
    },
    numMinted(state) {
      return state.numMinted;
    },
    allRed(state) {
      return state.myBots.every((i) => state.botColors[i] == "red");
    },
    allBlue(state) {
      return state.myBots.every((i) => state.botColors[i] == "blue");
    },
    flipInProgress(state) {
      return state.flipInProgress;
    },
  },
};
