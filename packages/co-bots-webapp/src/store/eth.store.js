export default {
  namespaced: true,
  state: () => ({ 
    walletAddress: "",
  }),
  mutations: { 
    SET_WALLET_ADDRESS(state, address) {
      state.walletAddress = address
    },
  },
  actions: { 
    setWalletAddress({ commit, dispatch }, address) {
      commit('SET_WALLET_ADDRESS', address)
    },
  },
  getters: { 
    walletAddress(state) {
      return state.walletAddress
    }, 
    walletConnected(state) {
      return state.walletAddress.length > 0
    },
  }
}