<template>
  <div class="text-white flex space-x-2 md:space-x-4 pr-2">
    <a class="py-1" href="https://twitter.com/thecobots" target="_blank">
      <img alt="twitter-logo" src="../images/twitter-logo.svg" />
    </a>
    <a :href="openSeaLink" target="_blank">
      <img alt="opensea-logo" src="../images/opensea-logo.svg" />
    </a>
    <a :href="etherScanLink" target="_blank">
      <img alt="etherscan-lgo" src="../images/etherscan-logo-.svg" />
    </a>
    <button
      v-if="walletConnected"
      class="w-40 h-[34px] rounded-full border-2 border-zinc-300 px-4 font-black"
      @click="logout"
    >
      {{ addressTruncated }}
    </button>
  </div>
</template>

<script>
const {
  VITE_OPENSEA_PROJECT_LINK,
  VITE_ETHERSCAN_BASE_URL,
  VITE_CONTRACT_ADDRESS,
} = import.meta.env;
import { mapGetters, mapActions } from "vuex";
import { disconnect } from "@/services/contract.service";
import { disconnectWC } from "@/services/wallectConnect.service";

export default {
  name: "SocialMedaiButtons",
  data: () => ({
    openSeaLink: VITE_OPENSEA_PROJECT_LINK,
    etherScanLink: `${VITE_ETHERSCAN_BASE_URL}${VITE_CONTRACT_ADDRESS}`,
  }),
  computed: {
    ...mapGetters("eth", ["walletConnected", "walletAddress"]),
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
    logout() {
      if (window.ethereum) disconnect();
      disconnectWC();
      this.setWalletAddress("");
    },
  },
};
</script>
