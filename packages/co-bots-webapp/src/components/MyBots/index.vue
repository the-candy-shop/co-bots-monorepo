<template>
  <div class="flex flex-col justify-center items-center pt-16 pb-20">
    <div class="uppercase text-[80px] text-white font-black mb-6 font-['CheeseButterCream']">my bots</div>

    <cb-button
      v-if="!walletConnected"
      :disabled="connecting"
      @click="openModal"
      class="bg-zinc-300 text-black w-[368px]"
      color="black"
    >
      {{ buttonText }}
    </cb-button>

    <div v-if="hasBots && totalSupply < 500" class="text-center">
      <div class="uppercase text-[32px] leading-[40px] text-cobots-green font-extrabold mb-6">🚨 5 ETH BONUS CONTEST 🚨</div>
      <div class="text-[20px] leading-[28px] font-extrabold text-zinc-300 mb-0">Enter the Twitter Raid for a chance to win one of five prizes of 1 ETH!</div>
      <div class="text-[20px] leading-[28px] font-extrabold text-zinc-300 mb-10">Learn more on <a  target="_blank" class="text-cobots-green" href="https://twitter.com/thecobots">Twitter</a>.</div>
    </div>

    <div v-if="hasBots && totalSupply >= 500 && totalSupply < 3000" class="text-center">
      <div class="uppercase text-[32px] leading-[40px] text-cobots-green font-extrabold mb-6">🚨 10 ETH BONUS CONTEST 🚨</div>
      <div class="text-[20px] leading-[28px] font-extrabold text-zinc-300 mb-0">Enter the first Meme Contest for a chance to win one of five prizes of 2 ETH!</div>
      <div class="text-[20px] leading-[28px] font-extrabold text-zinc-300 mb-10">Learn more on <a target="_blank" class="text-cobots-green" href="https://twitter.com/thecobots">Twitter</a>.</div>
    </div>

    <div v-if="hasBots && totalSupply >= 3000 && totalSupply < 8000" class="text-center">
      <div class="uppercase text-[32px] leading-[40px] text-cobots-green font-extrabold mb-6">🚨 20 ETH BONUS CONTEST 🚨</div>
      <div class="text-[20px] leading-[28px] font-extrabold text-zinc-300 mb-0">Enter the second Meme Contest for a chance to win one of five prizes of 4 ETH!</div>
      <div class="text-[20px] leading-[28px] font-extrabold text-zinc-300 mb-10">Learn more on <a target="_blank" class="text-cobots-green" href="https://twitter.com/thecobots">Twitter</a>.</div>
    </div>

    <div
      class="flex justify-center flex-wrap gap-4"
      v-if="walletConnected"
    >
      <div v-if="!hasBots" class="text-[20px] leading-[28px] font-extrabold text-cobots-silver-2 mb-0">You don't have any Co-Bots yet!</div>
      <bot-card v-for="b in myBots" :key="b" :index="b" />
    </div>
    <connect-wallet-modal v-if="modalOpen" @close="closeModal" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import BotCard from "./BotCard.vue";
import cbButton from "../shared/cbButton.vue";
import ConnectWalletModal from "../ConnectWalletModal.vue";
export default {
  name: "MyBotsSection",
  components: {
    BotCard,
    cbButton,
    ConnectWalletModal,
  },
  data: () => ({
    modalOpen: false,
    connecting: false,
  }),
  computed: {
    ...mapGetters("bots", [
      "myBots",
      "allRed",
      "allBlue",
      "hasBots",
      "flipInProgress",
    ]),
    ...mapGetters("contractState", ["canFlip"]),
    ...mapGetters("mint", ["totalSupply"]),
    ...mapGetters("eth", ["walletConnected", "walletAddress"]),
    buttonText() {
      if (this.connecting) return "connecting...";
      return "Connect Wallet";
    },
  },
  methods: {
    ...mapActions("bots", ["flipAllColors", "getMyBots"]),
    ...mapActions("bonus", ["getNumBlue"]),
    openModal() {
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
    },
  },
  watch: {
    walletAddress() {
      this.getMyBots(this.walletAddress);
    },
  },
};
</script>
