import { contract } from '../services/contract.service'
import { utils } from 'ethers'
export default {
  namespaced: true,
  state: () => ({ 
    mintPrice: 0,
    mintLimit: 0,
    maxMintPerAddress: 0,
    totalSupply: 0,
    mintInProgress: false,
    mintSuccessful: false
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
   },
  actions: {
    async getMintInfo({commit}) {
      let mintPrice = await contract.MINT_PUBLIC_PRICE()
      let formatted = utils.formatEther(mintPrice);
      commit('SET_MINT_PRICE', formatted)

      let maxPerAddress = await contract.MAX_MINT_PER_ADDRESS()
      commit('SET_MAX_MINT_PER_ADDRESS', maxPerAddress)

      let mintLimit = await contract.MAX_COBOTS()
      commit('SET_MINT_LIMIT', mintLimit)
    },
    async getTotalSupply({ commit }) {
      const totalSupply = await contract.totalSupply()
      commit('SET_TOTAL_SUPPLY', totalSupply)
    },
    async mint({ commit, state, dispatch }, numToMint) {
      commit('SET_MINT_SUCCESSFUL', false)
      commit('SET_MINT_IN_PROGRESS', true)
      let cost = (numToMint * state.mintPrice).toPrecision(2)
      try {
        const transaction = await contract.mintPublicSale(
          numToMint, 
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
    }
  }
}