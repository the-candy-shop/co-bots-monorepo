<template>
  <div
    class="fixed top-0 left-0 bg-black bg-opacity-50 w-screen h-screen"
    @click="$emit('close')"
  >
    <div class="flex flex-col w-full h-full justify-center items-center">
      <div class="bg-cobots-silver rounded-xl p-4 flex flex-col">
        <div class="uppercase text-black text-center font-extrabold mb-2 text-2xl">
          Connect wallet
        </div>
        <div class="grid grid-flow-col gap-2">
          <button
            v-if="hasMetaMask"
            class="border-2 bg-white border-zinc-300 rounded-2xl p-4 flex flex-col items-center"
            @click="connectMetaMask"
          >
            <img class="w-40" src="../images/MetamaskLogo.png" />

            <div class="uppercase text-zinc-400 text-center">metamask</div>
          </button>

          <button
            class="border-2 bg-white border-zinc-300 rounded-2xl p-4 flex flex-col items-center"
            @click.stop="connectWalletConnect"
          >
            <img class="w-40" src="../images/WalletConnectLogo.png" />

            <div class="uppercase text-zinc-400 text-center">
              wallet connect
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { connectWC } from "@/services/wallectConnect.service";
import { connect } from "@/services/contract.service";
export default {
  name: "ConnectWalletModal",
  emits: ["close"],
  computed: {
    hasMetaMask() {
      console.log(window);
      return window.ethereum !== undefined;
    },
  },
  methods: {
    ...mapActions("eth", ["setWalletAddress"]),
    async connectMetaMask() {
      connect();
    },
    async connectWalletConnect() {
      connectWC();
    },
  },
};
</script>
