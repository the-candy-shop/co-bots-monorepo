<template>
  <rules-section ref="info-section" />
</template>

<script>
import RulesSection from "@/components/RulesSection.vue";
import { mapActions } from "vuex";
export default {
  name: "Rules",
  components: {
    RulesSection,
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
