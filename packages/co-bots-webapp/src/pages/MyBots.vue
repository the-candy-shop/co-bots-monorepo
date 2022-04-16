<template>
  <div class="flex bg-black justify-center">
    <my-bots-section ref="my-bots" class="w-8/12 mt-[80px]" />
  </div>
</template>

<script>
import MyBotsSection from "@/components/MyBots/index.vue";
import { mapActions } from "vuex";
export default {
  name: "MyBots",
  components: {
    MyBotsSection,
  },
  methods: {
    ...mapActions("contractState", [
      "setNow",
      "getIsPublicSaleOpen",
      "getIsMintedOut",
    ]),
    ...mapActions("mint", ["getMintInfo"]),
  },
  mounted() {
    this.getIsPublicSaleOpen();
    this.getIsMintedOut();
    this.getMintInfo();
  },
};
</script>
