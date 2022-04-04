<template>
  <div
    class="bg-black h-[72px] flex flex-col justify-center fixed w-full border-b-2 border-white z-50"
  >
    <div class="flex py-2 pl-2 justify-between h-12 sm:hidden">
      <Logo class="w-[96px] fill-white" />
      <social-media-buttons class="w-24" />
    </div>
    <div class="flex-row flex items-center md:pl-9 sm:py-4 w-full pb-2">
      <Logo class="hidden sm:block fill-white" />

      <div
        class="w-full flex-row flex items-center justify-center text-[16px] lg:divide-x divide-cobots-silver-2"
      >
        <div class="items-center px-2 hidden lg:flex">
          <p class="text-cobots-silver-2 mr-1">MINTED:</p>
          <p class="text-white font-extrabold">
            {{ totalString }}/{{ maxString }}
          </p>
        </div>
        <div v-if="canMint" class="flex items-center px-2">
          <p class="text-cobots-silver-2 mr-1">MINT PRICE:</p>
          <p class="text-white font-black">{{ mintPrice }} ETH</p>
        </div>
        <count-down v-if="!refundEnabled" />
      </div>

      <social-media-buttons class="hidden sm:flex" />
    </div>
  </div>
</template>

<script>
import Logo from "@/components/logo.vue";
import SocialMediaButtons from "@/components/SocialMediaButtons.vue";
import CountDown from "@/components/Header/CountDown.vue";
import { mapActions, mapGetters } from "vuex";
export default {
  name: "Header",
  components: {
    Logo,
    SocialMediaButtons,
    CountDown,
  },
  data: () => ({
    refundEnabled: false,
  }),
  computed: {
    ...mapGetters("mint", ["totalSupply", "mintPrice", "mintLimit"]),
    ...mapGetters("contractState", ["canMint", "maxSupply", "now"]),
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
