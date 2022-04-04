import { contract } from "@/services/contract.service";

export default {
  namespaced: true,
  state: () => ({
    refundInProgress: false,
    refundComplete: false,
    refundActionEnabled: false,
  }),
  mutations: {
    SET_REFUND_IN_PROGRESS(state, inProgress) {
      state.refundInProgress = inProgress;
    },
    SET_REFUND_COMPLETE(state, complete) {
      state.refundComplete = complete;
    },
    SET_REFUND_ACTION_ENABLED(state, enabled) {
      state.refundActionEnabled = enabled;
    },
  },
  actions: {
    async claimRefund({ commit }, botIds) {
      commit("SET_REFUND_IN_PROGRESS", true);
      try {
        const botsToRefund = await Promise.all(
          botIds.map(async (i) => {
            let isRefunded = await contract.coBotsRefunded(i);
            return isRefunded ? null : i;
          })
        );
        const refundIds = botsToRefund.filter((i) => i != null);
        console.log({ refundIds });
        const transaction = await contract.claimRefund(refundIds);
        await transaction.wait();

        // const sleep = (callback, ms) => {
        //   setInterval(callback, ms);
        // };
        // await new Promise((resolve) => {
        //   sleep(resolve, 2000);
        // });
        commit("SET_REFUND_COMPLETE", true);
      } catch (e) {
        console.log(e.message);
      }
      commit("SET_REFUND_IN_PROGRESS", false);
    },
    async checkHasRefunded({ commit }, botIds) {
      const hasRefunded = await Promise.all(
        botIds.map(async (i) => {
          let isRefunded = await contract.coBotsRefunded(i);
          return isRefunded;
        })
      );
      const allBotsRefunded = hasRefunded.every((i) => i);
      commit("SET_REFUND_COMPLETE", allBotsRefunded);
      commit("SET_REFUND_ACTION_ENABLED", !allBotsRefunded);
    },
  },
  getters: {
    refundInProgress(state) {
      return state.refundInProgress;
    },
    refundComplete(state) {
      return state.refundComplete;
    },
    refundActionEnabled(state) {
      return state.refundActionEnabled;
    },
  },
};
