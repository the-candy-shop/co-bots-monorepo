<template>
  <!-- FIRST BAR -->
  <div>
    <div
      class="bg-black h-[72px] flex flex-col justify-center fixed w-full border-b-2 border-white z-50"
    >
      <!-- FIRST BAR MOBILE -->
      <div class="flex py-3 pl-6 pr-3 justify-between h-12 lg:hidden">
        <router-link to="/"><Logo class="w-[96px] fill-white" /></router-link>
        <Menu class="pr-4" />
      </div>

      <!-- FIRST BAR MEDIUM & LARGE -->
      <div class="flex-row hidden lg:flex justify-between items-center md:px-9 sm:py-4 w-full pb-2">
        <div class="flex-row flex lg:w-3/12">
          <router-link to="/"><Logo class="hidden sm:block fill-white" /></router-link>
          <div class="pl-8">
            <Menu />
          </div>
        </div>

        <div
          class="flex-row flex items-center justify-center text-[16px] lg:divide-x divide-cobots-silver-2"
        >
          <div class="items-center px-2 hidden lg:flex font-extrabold">
            <p class="text-cobots-silver-2 mr-1">MINTED:</p>
            <p class="text-cobots-green-2">
              {{ totalString }}/{{ maxString }}
            </p>
          </div>
        </div>

        <social-media-buttons class="hidden sm:flex lg:w-3/12 justify-end" />
      </div>
    </div>
    <div
      class="lg:hidden bg-black h-[72px] flex flex-col justify-center fixed top-[70px] w-full border-y-2 border-white z-50" style="border-top-color:#919699"
    >
      <social-media-buttons class="pl-6 pr-6" />
    </div>
  </div>
</template>

<script>
import Logo from "@/components/logo.vue";
import SocialMediaButtons from "@/components/SocialMediaButtons.vue";
import CountDown from "@/components/Header/CountDown.vue";
import Menu from "@/components/Header/Menu.vue";
import { mapActions, mapGetters } from "vuex";
export default {
  name: "Header",
  components: {
    Logo,
    SocialMediaButtons,
    CountDown,
    Menu,
  },
  data: () => ({
    refundEnabled: false,
  }),
  computed: {
    ...mapGetters("mint", ["totalSupply", "mintPrice", "mintLimit"]),
    ...mapGetters("contractState", ["canMint", "maxSupply", "now", "canFlip"]),
    ...mapGetters("eth", ["walletConnected", "walletAddress"]),
    ...mapGetters("bots", ["hasBots"]),
    showBots() {
      if (this.refundEnabled && !this.walletConnected) return false;
      if (this.hasBots && this.walletConnected) return true;
      if (!this.walletConnected && this.canFlip) return true;
      if (!this.walletConnected && !this.canFlip && !this.canMint) return true;
      return false;
    },
    totalString() {
      if (this.totalSupply) return this.totalSupply.toLocaleString("en-US");
      return "";
    },
    maxString() {
      if (this.maxSupply) return this.maxSupply.toLocaleString("en-US");
      return "";
    },
  },
  methods: {
    ...mapActions("mint", ["getTotalSupply"]),
  },
  wathc: {
    now() {
      if (this.canMint && this.now % 5 == 0) this.getTotalSupply();
    },
  },
  mounted() {
    this.getTotalSupply();
    this.refundEnabled = import.meta.env.VITE_IN_REFUND == "true";
  },
};
</script>
