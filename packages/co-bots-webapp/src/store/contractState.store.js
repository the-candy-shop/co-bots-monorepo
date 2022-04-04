import { contract } from "@/services/contract.service";

export default {
  namespaced: true,
  state: () => ({
    now: Date.now(), //used in getters
    isPublicSaleOpen: false, // is public sale open
    publicSaleStartTimestamp: null, // when mint started (timestamp)
    mintDuration: null, // duration of possible mint period (168H)
    mintRaffleDelay: null, //time after minted out to start draw (24H)
    isMintedOut: false, //project has minted out
    mintedOutTimestamp: null, // when project minted out
    isDrawOpen: false,
    cooperativeRaffleEnabled: false,
    maxSupply: null,
  }),
  mutations: {
    SET_NOW(state, now) {
      state.now = now;
    },
    SET_IS_PUBLIC_SALE_OPEN(state, isOpen) {
      state.isPublicSaleOpen = isOpen;
    },
    SET_PUBLIC_SALE_START_TIMESTAMP(state, ts) {
      state.publicSaleStartTimestamp = ts;
    },
    SET_MINT_DURATION(state, duration) {
      state.mintDuration = duration;
    },
    SET_MINT_RAFFLE_DELAY(state, delay) {
      state.mintRaffleDelay = delay;
    },
    SET_IS_MINTED_OUT(state, isMintedOut) {
      state.isMintedOut = isMintedOut;
    },
    SET_MINTED_OUT_TIMESTAMP(state, ts) {
      state.mintedOutTimestamp = ts;
    },
    SET_IS_DRAW_OPEN(state, isOpen) {
      state.isDrawOpen = isOpen;
    },
    SET_COOPERATIVE_RAFFLE_ENABLED(state, isEnabled) {
      state.cooperativeRaffleEnabled = isEnabled;
    },
    SET_MAX_SUPPLY(state, supply) {
      state.maxSupply = supply;
    },
  },
  actions: {
    setNow({ commit }, now) {
      commit("SET_NOW", now);
    },
    async getIsPublicSaleOpen({ commit }) {
      let maxSupply = await contract.MAX_COBOTS();
      commit("SET_MAX_SUPPLY", maxSupply);
      let isOpen = await contract.isPublicSaleOpen();
      commit("SET_IS_PUBLIC_SALE_OPEN", isOpen);
      if (isOpen) {
        let startTimestamp = await contract.publicSaleStartTimestamp();
        commit(
          "SET_PUBLIC_SALE_START_TIMESTAMP",
          startTimestamp.toNumber() * 1000
        );

        let mintDuration = await contract.COBOTS_MINT_DURATION();
        commit("SET_MINT_DURATION", mintDuration.toNumber() * 1000);
      }
    },
    async getIsMintedOut({ commit }) {
      let isMintedOut = await contract.isMintedOut();
      commit("SET_IS_MINTED_OUT", isMintedOut);
      if (isMintedOut) {
        let mintedOutTimestamp = await contract.mintedOutTimestamp();

        commit(
          "SET_MINTED_OUT_TIMESTAMP",
          mintedOutTimestamp.toNumber() * 1000
          // Date.now()
        );

        let mintRaffleDelay = await contract.COBOTS_MINT_RAFFLE_DELAY();
        commit(
          "SET_MINT_RAFFLE_DELAY",
          mintRaffleDelay.toNumber() * 1000
          // 10000
        );
      }
    },
    async getIsDrawOpen({ commit }) {
      let isOpen = await contract.isDrawOpen();
      commit("SET_IS_DRAW_OPEN", isOpen);
    },
    async getCooperativeRaffleEnabled({ commit }) {
      let isEnabled = await contract.cooperativeRaffleEnabled();
      commit("SET_COOPERATIVE_RAFFLE_ENABLED", isEnabled || true);
    },
  },
  getters: {
    now(state) {
      return state.now;
    },
    mintEndDate(state) {
      return state.publicSaleStartTimestamp + state.mintDuration;
    },
    flipEndDate(state) {
      return state.mintedOutTimestamp + state.mintRaffleDelay;
    },
    canMint(state) {
      let endDate = state.publicSaleStartTimestamp + state.mintDuration;
      return state.isPublicSaleOpen && state.now < endDate;
      // return false;
    },
    canFlip(state, getters) {
      if (getters.canMint) return false;
      let endDate = state.mintedOutTimestamp + state.mintRaffleDelay;
      return state.isMintedOut && state.now < endDate;
      // return true;
    },
    cooperativeRaffleEnabled(state) {
      return state.cooperativeRaffleEnabled;
    },
    maxSupply(state) {
      return state.maxSupply;
    },
    mintFailed(state, getters) {
      return !getters.canMint && !state.isMintedOut;
      // return false;
    },
  },
};
