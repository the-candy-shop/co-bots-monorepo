import { contract } from '../services/contract.service'
import { utils } from 'ethers'
import { fakeFulfillmentData } from '../services/fakeFulfillmentData'

export default {
  namespaced: true,
  state: () => ({ 
    mintPrice: 0,
    mintLimit: 0,
    maxMintPerAddress: 0,
    totalSupply: 0,
    mintInProgress: false,
    mintSuccessful: false,
    fulfillments: [],
    winnerImages: {},
  }),
  mutations: { 
    SET_MINT_PRICE(state, price) {
      state.mintPrice = price
    },
    SET_MINT_LIMIT(state, limit) {
      state.mintLimit = limit
    },
    SET_MAX_MINT_PER_ADDRESS(state, max) {
      state.maxMintPerAddress = max
    },
    SET_TOTAL_SUPPLY(state, supply) {
      state.totalSupply = supply
    },
    SET_MINT_IN_PROGRESS(state, inProgress) {
      state.mintInProgress = inProgress
    },
    SET_MINT_SUCCESSFUL(state, isSuccessful) {
      state.mintSuccessful = isSuccessful
    },
    SET_FULFILLMENTS(state, fulfillments) {
      state.fulfillments = fulfillments;
    },
    SET_WINNER_IMAGE_BY_FULFILLMENT_INDEX(state, { image, index }) {
      state.winnerImages[index] = image;
    },
   },
  actions: {
    async getMintInfo({commit}) {
      let parameters = await contract.PARAMETERS()
      let mintPrice = parameters.mintPublicPrice

      let formatted = utils.formatEther(mintPrice);
      commit('SET_MINT_PRICE', formatted)

      commit('SET_MAX_MINT_PER_ADDRESS', parameters.maxCobots)
      commit('SET_MINT_LIMIT', parameters.maxCobots)
    },
    async getTotalSupply({ commit }) {
      const totalSupply = await contract.totalSupply()
      commit('SET_TOTAL_SUPPLY', totalSupply)
    },
    async getFulfillments({commit}) {
      let fulfillments = await contract.getOrderedFulfillments()

      commit('SET_FULFILLMENTS', fulfillments)
    },
    async getWinnerImageForFulfillmentIndex({ commit, state }, index) {
      const tokenURI = await contract.tokenURI(state.fulfillments[index].winner.tokenId);
      const data = JSON.parse(
        tokenURI.split("data:application/json,")[1]
      );
      commit("SET_WINNER_IMAGE_BY_FULFILLMENT_INDEX", { image: data.image, index });
    },

    async mint({ commit, state, dispatch }, numToMint) {
      commit('SET_MINT_SUCCESSFUL', false)
      commit('SET_MINT_IN_PROGRESS', true)
      let cost = (numToMint * state.mintPrice).toPrecision(2)
      try {
        const transaction = await contract.mintPublicSale(
          numToMint,
          [],
          { value: utils.parseEther(`${cost}`) 
        })
        await transaction.wait()
        commit('SET_MINT_SUCCESSFUL', true)
        dispatch('getTotalSupply')
      } catch(e) {
        console.log(e)
      }
      commit('SET_MINT_IN_PROGRESS', false)
      
    }
  },
  getters: { 
    mintPrice(state) {
      return state.mintPrice
    },
    mintLimit(state) {
      return state.mintLimit
    },
    totalSupply(state) {
      return state.totalSupply
    },
    mintInProgress(state) {
      return state.mintInProgress
    },
    mintSuccessful(state) {
      return state.mintSuccessful
    },
    orderedFulfillments(state) {
      return state.fulfillments
    },
    winnerImageByFulfillmentIndex: (state) => (idx) => {
      return state.winnerImages[idx] || null;
    },
  }
}