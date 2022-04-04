<template>
  <div class="overflow-hidden overscroll-none">
    <div
      class="flex flex-col justify-center items-center mt-[72px]"
      :class="{
        'h-[calc(100vh-72px)]':
          canFlip || canMint || mintFailed || refundEnabled,
      }"
    >
      <div
        v-if="walletConnected"
        class="absolute sm:right-4 top-[90px] sm:top-[90px]"
      >
        <wallet-button @viewBots="scrollToMyBots" />
      </div>
      <connect-wallet-panel
        v-if="!walletConnected && !canFlip && (canMint || refundEnabled)"
      />
      <refund v-else-if="refundEnabled" />
      <mint-panel v-else-if="canMint" />
      <div class="flex-grow" v-else-if="mintFailed"></div>
      <bonus-challenge-panel
        v-else-if="canFlip"
        @moreDetailsClick="scrollToBonusPrizes"
      />
      <raffle v-else />
      <img
        class="hidden lg:block w-full"
        src="../images/Bot-Illustration.svg"
      />
      <img
        class="block lg:hidden"
        src="../images/Bot-Illustration-Mobile.svg"
      />
    </div>

    <div class="bg-black text-white flex flex-col items-center">
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
import WalletButton from "@/components/walletButton.vue";
import MyBotsSection from "@/components/MyBots/index.vue";
import ConnectWalletPanel from "@/components/ConnectWalletPanel.vue";
import MintPanel from "@/components/MintPanel.vue";
import BonusChallengePanel from "@/components/BonusChallenge/index.vue";
import { mapGetters, mapActions } from "vuex";
import Raffle from "@/components/Raffle/index.vue";
import Refund from "@/components/Refund.vue";

export default {
  name: "Home",
  components: {
    InfoSection,
    WalletButton,
    MyBotsSection,
    ConnectWalletPanel,
    MintPanel,
    BonusChallengePanel,
    Raffle,
    Refund,
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
