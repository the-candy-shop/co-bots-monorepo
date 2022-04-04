<template>
  <div class="flex flex-col items-center space-y-4 sm:space-y-4">
    <button
      class="w-40 rounded-full border-2 border-zinc-300 px-4 py-2 font-black"
      @click="logout"
    >
      {{ addressTruncated }}
    </button>
    <button
      class="uppercase underline font-black text-sky-400 text-[16px] leading-4"
      v-if="hasBots"
      @click="viewBots"
    >
      View my bots
    </button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { disconnect } from "@/services/contract.service";
import { disconnectWC } from "@/services/wallectConnect.service";
export default {
  name: "walletButton",
  emits: ["view-bots"],
  computed: {
    ...mapGetters("eth", ["walletAddress"]),
    ...mapGetters("bots", ["hasBots"]),
    addressTruncated() {
      let start = this.walletAddress.substring(0, 4);
      let end = this.walletAddress.substring(
        this.walletAddress.length - 4,
        this.walletAddress.length
      );
      return `${start}...${end}`;
    },
  },
  methods: {
    ...mapActions("eth", ["setWalletAddress"]),
    ...mapActions("bots", ["getMyBots"]),
    viewBots() {
      this.$emit("view-bots");
      this.getMyBots(this.walletAddress);
    },
    logout() {
      if (window.ethereum) disconnect();
      disconnectWC();
      this.setWalletAddress("");
    },
  },
};
</script>
