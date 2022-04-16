<template>
  <info-section ref="info-section" />
</template>

<script>
import InfoSection from "@/components/InfoSection.vue";
import { mapActions, mapGetters } from "vuex";
export default {
  name: "Faq",
  components: {
    InfoSection,
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
