<template>
  <div
    class="pt-32 px-6 sm:pt-10 text-center flex flex-col items-center pb-[120px]"
  >
    <div class="uppercase font-black text-6xl text-cobots-green mb-16">
      winners
    </div>
    <div class="font-black text-[16px] leading-[24px] md:w-[560px] mb-10">
      1 winner will be drawn every minute until all are drawn. Prizes will be
      sent to the winners by the smart contract as soon as they are drawn.
      Thanks for playing!
    </div>
    <main-prizes class="mb-16" />
    <div
      v-if="cooperativeRaffleEnabled"
      class="w-full border-b-2 border-cobots-silver"
    ></div>
    <bonus-prizes v-if="cooperativeRaffleEnabled" class="mt-16" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import BonusPrizes from "./BonusPrizes.vue";
import MainPrizes from "./MainPrizes.vue";
export default {
  name: "Raffle",
  components: {
    MainPrizes,
    BonusPrizes,
  },
  data: () => ({
    interval: null,
  }),
  computed: {
    ...mapGetters("contractState", [
      "cooperativeRaffleEnabled",
      "canFlip",
      "now",
    ]),
    ...mapGetters("prizes", ["drawCount"]),
  },
  methods: {
    ...mapActions("contractState", ["getCooperativeRaffleEnabled"]),
    ...mapActions("prizes", ["getDrawCount", "getRaffleInfo", "getWinners"]),
  },
  watch: {
    canFlip() {
      this.getDrawCount();
    },
    now() {
      if (this.now % 5 == 0) {
        this.getDrawCount();
      }
    },
  },
  mounted() {
    this.getCooperativeRaffleEnabled();
    this.getRaffleInfo();
    this.getDrawCount();
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
};
</script>
