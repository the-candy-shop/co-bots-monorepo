<template>
  <div class="text-white flex justify-between lg:justify-end items-center">
    <div class="flex space-x-2 md:space-x-4 justify-end">
      <a class="py-1" href="https://twitter.com/thecobots" target="_blank">
        <TwitterLogo class="fill-cobots-silver-2 hover:fill-white" />
      </a>
      <a :href="openSeaLink" target="_blank">
        <OpenseaLogo class="fill-cobots-silver-2 hover:fill-white" />
      </a>
      <a :href="etherScanLink" target="_blank">
        <EtherscanLogo class="fill-cobots-silver-2 hover:fill-white" />
      </a>
    </div>
    <button
      v-if="walletConnected"
      class="w-[160px] h-[40px] rounded-full border-2 border-zinc-300 px-4 ml-4 font-black"
      @click="logout"
    >
      {{ addressTruncated }}
    </button>
    <connect-wallet-panel
      v-if="!walletConnected" black
    />
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
import TwitterLogo from "@/components/TwitterLogo.vue";
import OpenseaLogo from "@/components/OpenseaLogo.vue";
import EtherscanLogo from "@/components/EtherscanLogo.vue";
import ConnectWalletPanel from "./ConnectWalletPanel.vue";

export default {
  name: "SocialMedaiButtons",
  components: {
    TwitterLogo,
    OpenseaLogo,
    EtherscanLogo,
    ConnectWalletPanel,
  },
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
