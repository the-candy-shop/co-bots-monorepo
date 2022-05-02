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
      :disabled="mintInProgress || mintedLimit || !canMint"
    >
      <loading-animation v-if="mintInProgress" />
      <text v-else>{{ mintBtnText }}</text>
    </cb-button>

    <scroll-label v-if="mintSuccessful" class="text-cobots-green mt-8">
      mint complete!
    </scroll-label>

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
      max: 20,
      modalOpen: localStorage.getItem("answer") === null,
    };
  },
  computed: {
    ...mapGetters("mint", ["mintLimit", "mintInProgress", "mintSuccessful", "mintPrice"]),
    ...mapGetters("layout", ["panelHeightClass", "headerHeight"]),
    ...mapGetters("contractState", ["canMint"]),
    ...mapGetters("bots", ["numMinted"]),
    atMax: function () {
      if (this.numToMint + this.numMinted >= this.max) return true;
      if (this.numToMint + this.numMinted >= this.mintLimit) return true;
      return false;
    },
    atMin: function () {
      return this.numToMint <= 1;
    },
    mintedLimit: function () {
      return this.numMinted >= this.max;
    },
    firstDigit() {
      return parseInt(this.numToMint / 10);
    },
    secondDigit() {
      return this.numToMint % 10;
    },
    mintBtnText() {
      if (this.mintedLimit) return "You hit your limit";
      else if (this.mintInProgress) return "Minting...";

      const mintPrice = (this.numToMint * this.mintPrice).toFixed(2); 
      return "Mint: " + mintPrice + " eth";
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
      await this.mint(this.numToMint);
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
