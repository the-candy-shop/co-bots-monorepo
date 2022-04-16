<template>
  <div class="overflow-hidden overscroll-none">
    <div class="flex flex-col justify-center items-center">
      <img
        class="hidden lg:block w-full mt-[72px] max-w-3xl p-6"
        src="../images/ExtravagainzaLabel.png"
      />

      <div class="w-[200px] h-1 bg-cobots-silver rounded"></div>

      <div class="font-['CheeseButterCream'] mb-4 mt-11 px-6 text-black text-3xl">Hey Anon, wanna play a game?</div>
      <div class="w-[675px] text-cobots-silver-3 text-xl px-6">It's simple: at each mint checkpoint, a Co-Bot wins a prize. The earlier you mint, the more chances you have to win. Good luck!</div>
    </div>
    <div
      class="flex flex-col justify-center items-center my-12"
      :class="{
        '':
          canFlip || canMint || mintFailed || refundEnabled,
      }"
    >
      <div class="w-96 bg-cobots-silver rounded-3xl p-4 flex flex-col h-[248px]">
        <div class="text-2xl text-center font-extrabold text-cobots-silver-3">MINT CO-BOTS</div>
        <connect-wallet-panel
          v-if="!walletConnected && !canFlip && (canMint || refundEnabled)"
        />
        <mint-panel v-else-if="canMint" />
        <div class="flex-grow" v-else-if="mintFailed"></div>
        <bonus-challenge-panel
          v-else-if="canFlip"
          @moreDetailsClick="scrollToBonusPrizes"
        />
        <raffle v-else />
      </div>
    </div>

    <div class="bg-black text-white flex flex-col items-center">
      <div class="flex flex-col mt-32 text-[80px] leading-[80px] font-['CheeseButterCream'] items-center">
        <div>MINT</div>
        <div>PROGRESS</div>
      </div>
      <div class="flex flex-col mt-20">
        <div class="rounded-t-full flex flex-col justify-center w-24 h-24 bg-cobots-silver-4 border-cobots-silver-2 border-x-4 border-t-4"></div>
        <gauge-stack percentage=100 eth=1 />
        <gauge-separator small />
        <gauge-stack percentage=200 eth=2 />
        <gauge-separator small />
        <gauge-stack percentage=300 eth=3 />
        <gauge-separator small />
        <gauge-stack percentage=400 eth=4 />
        <gauge-separator small />
        <gauge-stack percentage=500 eth=5 />
        <gauge-separator medium />
        <gauge-stack percentage=750 eth=6 />
        <gauge-separator medium />
        <gauge-stack percentage=1000 eth=7 />
        <gauge-separator large />
        <gauge-stack percentage=1500 eth=8 />
        <gauge-separator large />
        <gauge-stack percentage=2000 eth=9 />
        <gauge-separator xlarge />
        <gauge-stack percentage=3000 eth=10 />
        <gauge-separator xlarge />
        <gauge-stack percentage=4000 eth=12 />
        <gauge-separator xlarge />
        <gauge-stack percentage=5000 eth=14 />
        <gauge-separator xlarge />
        <gauge-stack percentage=6000 eth=16 />
        <gauge-separator xlarge />
        <gauge-stack percentage=7000 eth=18 />
        <gauge-separator xlarge />
        <gauge-stack percentage=8000 eth=20 />
        <gauge-separator xlarge />
        <gauge-stack percentage=9000 eth=22 />
        <gauge-separator xlarge />
        <gauge-stack percentage=10k eth=24 />
        <div class="rounded-b-full flex flex-col justify-center w-24 h-12 bg-cobots-silver-4 border-cobots-silver-2 border-x-4 border-b-4"></div>
      </div>
      <my-bots-section ref="my-bots" v-if="showBots" />
      <hr
        v-if="canFlip || hasBots"
        class="border-cobots-silver-3 w-full border"
      />
      <info-section ref="info-section" />
    </div>
  </div>
</template>

<script>
import InfoSection from "@/components/InfoSection.vue";
import MyBotsSection from "@/components/MyBots/index.vue";
import ConnectWalletPanel from "@/components/ConnectWalletPanel.vue";
import MintPanel from "@/components/MintPanel.vue";
import BonusChallengePanel from "@/components/BonusChallenge/index.vue";
import { mapGetters, mapActions } from "vuex";
import Raffle from "@/components/Raffle/index.vue";
import Refund from "@/components/Refund.vue";
import GaugeStack from "@/components/GaugeStack.vue";
import GaugeSeparator from "@/components/GaugeSeparator.vue";

export default {
  name: "Home",
  components: {
    InfoSection,
    MyBotsSection,
    ConnectWalletPanel,
    MintPanel,
    BonusChallengePanel,
    Raffle,
    Refund,
    GaugeStack,
    GaugeSeparator
  },
  data: () => ({
    interval: null,
    refundEnabled: false,
  }),
  computed: {
    ...mapGetters("eth", ["walletConnected", "walletAddress"]),
    ...mapGetters("bots", ["hasBots"]),
    ...mapGetters("contractState", ["canMint", "canFlip", "mintFailed"]),
    ...mapGetters("mint", ["mintSuccessful"]),
    showBots() {
      if (this.refundEnabled && !this.walletConnected) return false;
      if (this.hasBots && this.walletConnected) return true;
      if (!this.walletConnected && this.canFlip) return true;
      if (!this.walletConnected && !this.canFlip && !this.canMint) return true;
      return false;
    },
  },
  methods: {
    ...mapActions("contractState", [
      "setNow",
      "getIsPublicSaleOpen",
      "getIsMintedOut",
    ]),
    ...mapActions("eth", ["setWalletAddress"]),
    ...mapActions("mint", ["getMintInfo"]),
    ...mapActions("bots", ["getMyBots"]),
    ...mapActions("bonus", ["getBonusRaffleData"]),
    scrollToBonusPrizes() {
      const el = this.$refs["info-section"].$refs["bonus-prizes-info"].$el;
      this.$scrollTo(el, 600, { offset: -50 });
    },
    scrollToMyBots() {
      const el = this.$refs["my-bots"].$el;
      this.$scrollTo(el, 600, { offset: -40 });
    },
  },
  watch: {
    walletAddress() {
      this.getMyBots(this.walletAddress);
    },
    mintSuccessful() {
      if (this.walletConnected && this.mintSuccessful) {
        this.getMyBots(this.walletAddress);
        this.getIsMintedOut();
      }
    },
    canMint() {
      if (this.canMint) this.getBonusRaffleData();
    },
  },
  mounted() {
    this.interval = setInterval(() => {
      this.setNow(Date.now());
    }, 1000);

    this.getIsPublicSaleOpen();
    this.getIsMintedOut();
    this.getMintInfo();
    this.refundEnabled = import.meta.env.VITE_IN_REFUND == "true";
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
};
</script>
