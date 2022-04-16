<template>
  <div class="flex flex-col justify-center items-center pt-16 pb-20">
    <div class="uppercase text-5xl text-white font-black mb-10 font-['CheeseButterCream']">my bots</div>
    <cb-button
      v-if="!walletConnected"
      :disabled="connecting"
      @click="openModal"
    >
      {{ buttonText }}
    </cb-button>
    <div class="flex flex-col space-y-4 pb-5" v-else-if="canFlip && hasBots">
      <button
        class="w-[320px] h-[65px] rounded-lg uppercase font-black text-[20px] leading-[20px] pt-[24px] pb-[20px] bg-sky-400"
        :class="{
          'opacity-50': allBlue || flipInProgress,
          'cursor-not-allowed': allBlue || flipInProgress,
        }"
        @click="flipBlue"
      >
        Flip All to blue
      </button>

      <button
        class="w-[320px] h-[65px] rounded-lg uppercase font-black text-[20px] leading-[20px] pt-[24px] pb-[20px] bg-cobots-red"
        :class="{
          'opacity-50': allRed || flipInProgress,
          'cursor-not-allowed': allRed || flipInProgress,
        }"
        @click="flipRed"
      >
        Flip All to Red
      </button>
    </div>
    <div
      class="flex justify-center flex-wrap px-16 gap-4"
      v-if="walletConnected"
    >
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
    ...mapGetters("eth", ["walletConnected"]),
    buttonText() {
      if (this.connecting) return "connecting...";
      return "Connect";
    },
  },
  methods: {
    ...mapActions("bots", ["flipAllColors"]),
    ...mapActions("bonus", ["getNumBlue"]),
    async flipRed() {
      if (this.flipInProgress) return;
      if (!this.allRed) {
        await this.flipAllColors("red");
        this.getNumBlue();
      }
    },
    async flipBlue() {
      if (this.flipInProgress) return;
      if (!this.allBlue) {
        await this.flipAllColors("blue");
        this.getNumBlue();
      }
    },
    openModal() {
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
    },
  },
};
</script>
