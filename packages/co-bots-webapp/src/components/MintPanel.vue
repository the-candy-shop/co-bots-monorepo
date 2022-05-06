<template>
  <div class="flex flex-col items-center justify-center flex-grow">
    <div class="flex items-center space-x-6 bg-white rounded-2xl w-full justify-between px-4 mb-4 mt-4">
      <counter-button :disabled="atMin || mintInProgress" @click="decrement">
        <img class="w-4 h-4" src="../images/minus-icon.svg" />
      </counter-button>

      <div class="font-['CheeseButterCream'] text-7xl leading-[70px] font-black flex">
        <div class="w-10 mr-1 text-center pt-4">{{ firstDigit }}</div>
        <div class="w-10 text-center pt-4">{{ secondDigit }}</div>
      </div>

      <counter-button :disabled="atMax || mintInProgress" @click="increment">
        <img class="w-4 h-4" src="../images/plus-icon.svg" />
      </counter-button>
    </div>

    <cb-button
      @click="localMint"
      :disabled="mintInProgress || !canMint"
    >
      <loading-animation v-if="mintInProgress" />
      <text v-else>{{ mintBtnText }}</text>
    </cb-button>

    <scroll-label v-if="mintSuccessful" class="text-cobots-green mt-8">
      mint complete! <router-link to="/my-bots" class="underline">view my bots</router-link>
    </scroll-label>

    <div v-if="myV1BotsWithDiscount.length != 0" class="text-center mt-8 text-cobots-green font-extrabold text-[14px] leading-[20px] uppercase"
        :class="{
          'mt-12': mintInProgress,
        }"
    >Your DISCOUNT FOR HOLDING {{myV1BotsWithDiscount.length}} Co-BOT 1.0s has been automatically applied!</div>

    <skill-testing-modal @close="closeModal" v-if="modalOpen" />
  </div>
</template>

<script>
import cbButton from "./shared/cbButton.vue";
import scrollLabel from "./shared/scrollLabel.vue";
import counterButton from "./counterButton.vue";
import { mapActions, mapGetters } from "vuex";
import LoadingAnimation from "./shared/loadingAnimation.vue";
import SkillTestingModal from "./SkillTestingModal.vue";
import numeral from "numeral"

export default {
  name: "MintPanel",
  components: {
    cbButton,
    scrollLabel,
    counterButton,
    LoadingAnimation,
    SkillTestingModal
  },
  data() {
    return {
      numToMint: 1,
      modalOpen: false,
      totalMintPrice: 0,
    };
  },
  computed: {
    ...mapGetters("mint", ["mintInProgress", "mintSuccessful", "mintPrice", "cobotsV1Discount"]),
    ...mapGetters("layout", ["panelHeightClass", "headerHeight"]),
    ...mapGetters("contractState", ["canMint"]),
    ...mapGetters("bots", ["numMinted", "myV1BotsWithDiscount"]),
    atMax: function () {
      return false;
    },
    atMin: function () {
      return this.numToMint <= 1;
    },
    firstDigit() {
      return parseInt(this.numToMint / 10);
    },
    secondDigit() {
      return this.numToMint % 10;
    },
    mintBtnText() {
      if (this.mintInProgress) return "Minting...";

      const myV1BotsWithDiscount = this.myV1BotsWithDiscount

      const discountedPrice = numeral(this.mintPrice).divide(this.cobotsV1Discount)
      const publicPrice = numeral(this.mintPrice)

      var numToMint = this.numToMint
      var discountAvailable = myV1BotsWithDiscount.length
      var totalMintPrice = numeral(0)

      var i;
      for (i = 0; i < numToMint; ++i) {
        if (discountAvailable > 0) {
          totalMintPrice = totalMintPrice.add(discountedPrice.value())
          --discountAvailable
          
          continue
        }

        totalMintPrice = totalMintPrice.add(publicPrice.value())
      }

      this.totalMintPrice = totalMintPrice.value()

      return "Mint: " + this.totalMintPrice + " eth";
    },
  },
  watch: {
    mintSuccessful() {
      if (this.mintSuccessful) {
        this.numToMint = 1;
      }
    },
  },
  methods: {
    ...mapActions("mint", ["mint"]),
    increment() {
      if (!this.atMax) this.numToMint += 1;
    },
    decrement() {
      if (!this.atMin) this.numToMint -= 1;
    },
    async localMint() {
      if (localStorage.getItem("answer") === null) {
        this.openModal();
      } else {
        await this.mint({
          numToMint: this.numToMint, 
          price: this.totalMintPrice,
          cobots: this.myV1BotsWithDiscount
        });
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
