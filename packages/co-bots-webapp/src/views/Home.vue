<template>
  <div class="overflow-hidden overscroll-none">
    <div class="bg-white pb-10">
      <div class="flex flex-col justify-center items-center">
        <img
          class="w-full mt-[144px] lg:mt-[72px] max-w-3xl p-6"
          src="../images/ExtravagainzaLabel.png"
        />

        <div class="w-[200px] h-1 bg-cobots-silver rounded"></div>

        <div class="font-['CheeseButterCream'] mb-4 mt-11 px-6 text-black text-3xl">Hey Anon, wanna play a game?</div>
        <div class="lg:w-[675px] text-cobots-silver-3 text-xl px-6">It's simple: at each mint checkpoint, a Co-Bot wins a prize. The earlier you mint, the more chances you have to win. Good luck!</div>
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
        </div>
      </div>
    </div>
    <wave />

    <div class="bg-black text-white flex flex-col items-center pb-16">
      <div class="flex flex-col mt-32 text-[80px] leading-[80px] font-['CheeseButterCream'] items-center">
        <div>MINT</div>
        <div>PROGRESS</div>
      </div>
      <div class="flex flex-row justify-center">
        <div class="w-[253px] lg:w-[364px] hidden lg:block invisible"></div>
        <div class="flex flex-col mt-[48px]">
          <div class="relative">
            <div class="rounded-t-full flex flex-col justify-center w-24 h-24 bg-cobots-silver-4 border-cobots-silver-2 border-x-[6px] border-t-[6px]"
            ></div>
            <div class="absolute left-0 top-0 rounded-t-full flex flex-col justify-center w-24 h-24 bg-cobots-green border-cobots-green-3 border-x-[6px] border-t-[6px]"
              :style="{height:getCompletionState(0, 50, totalSupply) + '%'}"
            ></div>
          </div>
          <gauge-stack percentage=100 />
          <gauge-separator small percentage=150 />
          <gauge-stack percentage=200 />
          <gauge-separator small percentage=250 />
          <gauge-stack percentage=300 />
          <gauge-separator small percentage=350 />
          <gauge-stack percentage=400 />
          <gauge-separator small percentage=450 />
          <gauge-stack percentage=500 />
          <gauge-separator medium percentage=625 />
          <gauge-stack percentage=750 />
          <gauge-separator medium percentage=875 />
          <gauge-stack percentage=1000 />
          <gauge-separator large percentage=1250 />
          <gauge-stack percentage=1500 />
          <gauge-separator large percentage=1750 />
          <gauge-stack percentage=2000 />
          <gauge-separator xlarge percentage=2500 />
          <gauge-stack percentage=3000 />
          <gauge-separator xlarge percentage=3500 />
          <gauge-stack percentage=4000 />
          <gauge-separator mlarge percentage=4500 />
          <gauge-stack percentage=5000 />
          <gauge-separator mlarge percentage=5500 />
          <gauge-stack percentage=6000 />
          <gauge-separator xlarge percentage=6500 />
          <gauge-stack percentage=7000 />
          <gauge-separator xlarge percentage=7500 />
          <gauge-stack percentage=8000 />
          <gauge-separator xlarge percentage=8500 />
          <gauge-stack percentage=9000 />
          <gauge-separator xlarge percentage=9500 />
          <gauge-stack percentage=10000 />
          <div class="relative">
            <div class="rounded-b-full flex flex-col justify-center w-24 h-12 bg-cobots-silver-4 border-cobots-silver-2 border-x-[6px] border-b-[6px]"></div>
            <div class="absolute left-0 top-0 rounded-b-full flex flex-col justify-center w-24 h-12 bg-cobots-green border-cobots-green-3 border-x-[6px]"
                :style="{height:(totalSupply == 10000 ? '100%' : '0')}"
            ></div>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col mt-20 text-center justify-center items-center">
        <div class="font-extrabold text-[36px] leading-[36px] text-gold">GRAND PRIZE</div>
        <div class="text-cobots-green font-extrabold text-[104px] leading-[104px] mt-2 font-['CheeseButterCream']">
          <span class="mr-6">69</span>
          <span>ETH</span>
        </div>
        <div class="flex flex-col justify-center items-center w-[240px] h-[240px] p-3 border-cobots-silver-2 border-4 border-dashed rounded-3xl">
            <a target="_blank" v-if="grandPrizeFulfillmentIndex !== undefined" :href="openseaLink(winnerIndexByFulfillmentIndex(grandPrizeFulfillmentIndex))">
              <img
                :src="winnerImageByFulfillmentIndex(grandPrizeFulfillmentIndex)"
                class="rounded-2xl bg-white"
                @load="onImageLoad"
              />
            </a>
            <div class="font-['CheeseButterCream'] text-[48px] leading-[48px] flex justify-center items-center w-full h-full rounded-[8px] bg-cobots-silver-7" v-else>
              ???
            </div>
          </div>
      </div>

    </div>
  </div>
</template>

<script>
import ConnectWalletPanel from "@/components/ConnectWalletPanel.vue";
import MintPanel from "@/components/MintPanel.vue";
import BonusChallengePanel from "@/components/BonusChallenge/index.vue";
import { mapGetters, mapActions } from "vuex";
import Raffle from "@/components/Raffle/index.vue";
import Refund from "@/components/Refund.vue";
import GaugeStack from "@/components/GaugeStack.vue";
import GaugeSeparator from "@/components/GaugeSeparator.vue";
import Wave from "@/components/wave.vue";
import { getCompletionState } from "@/services/mintCompletion.service";

export default {
  name: "Home",
  components: {
    ConnectWalletPanel,
    MintPanel,
    BonusChallengePanel,
    Raffle,
    Refund,
    GaugeStack,
    GaugeSeparator,
    Wave
  },
  data: () => ({
    interval: null,
    refundEnabled: false,
    minted: 50,
  }),
  computed: {
    ...mapGetters("eth", ["walletConnected", "walletAddress"]),
    ...mapGetters("contractState", ["canMint", "canFlip", "mintFailed"]),
    ...mapGetters("mint", ["mintSuccessful", "totalSupply", "orderedFulfillments", "winnerImageByFulfillmentIndex", "winnerIndexByFulfillmentIndex"]),
    grandPrizeFulfillmentIndex() {
      var indexes = [], i;
      for (i = 0; i < this.orderedFulfillments.length; i++) {
          if (this.orderedFulfillments[i].fulfilled && this.orderedFulfillments[i].prize.checkpoint == 10000) {
            indexes.push(i);
            this.getWinnerImageForFulfillmentIndex(i);
          }
      }

      if (indexes.length === 2) {
        // grand prize is the second entry for 10000 checkpoint
        return indexes[1];
      }
      
      return undefined;
    },
  },
  methods: {
    ...mapActions("contractState", [
      "setNow",
      "getIsPublicSaleOpen",
      "getIsMintedOut",
    ]),
    ...mapActions("eth", ["setWalletAddress"]),
    ...mapActions("mint", ["getMintInfo", "getFulfillments", "getWinnerImageForFulfillmentIndex"]),
    ...mapActions("bots", ["getMyBots"]),
    ...mapActions("bonus", ["getBonusRaffleData"]),
    scrollToBonusPrizes() {
      const el = this.$refs["info-section"].$refs["bonus-prizes-info"].$el;
      this.$scrollTo(el, 600, { offset: -50 });
    },
    getCompletionState,
    openseaLink(index) {
      const { VITE_OPENSEA_BASE_URL, VITE_CONTRACT_ADDRESS } = import.meta.env;
      let link = `${VITE_OPENSEA_BASE_URL}${VITE_CONTRACT_ADDRESS}/${index}`;
      return link;
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
    this.getFulfillments();
    setInterval(() => {
      this.getFulfillments();
    }, 10000);

    this.refundEnabled = import.meta.env.VITE_IN_REFUND == "true";
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
};
</script>
