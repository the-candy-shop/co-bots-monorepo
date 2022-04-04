<template>
  <div class="flex flex-col items-center justify-center flex-grow">
    <div
      v-if="!refundComplete"
      class="flex flex-col items-center justify-center"
    >
      <cb-button
        class="mb-4"
        :disabled="refundInProgress || !refundActionEnabled"
        @click="claimRefund(myBots)"
      >
        {{ buttonText }}
      </cb-button>
      <scroll-label
        class="text-center uppercase font-black text-[14px] leading-[20px] text-cobots-silver-2"
      >
        this will refund you the mint price <br />
        for all co-bots in your wallet
      </scroll-label>
    </div>
    <div v-else class="flex flex-col items-center justify-center">
      <h1 class="font-black text-5xl mb-4">REFUND CLAIMED</h1>
      <scroll-label
        class="text-center uppercase font-black text-[14px] leading-[20px] text-cobots-silver-2"
      >
        thanks for supporting co-bots!
      </scroll-label>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import CbButton from "./shared/cbButton.vue";
import scrollLabel from "./shared/scrollLabel.vue";
export default {
  name: "Refund",
  components: {
    CbButton,
    scrollLabel,
  },
  computed: {
    ...mapGetters("refund", [
      "refundInProgress",
      "refundComplete",
      "refundActionEnabled",
    ]),
    ...mapGetters("bots", ["myBots"]),
    buttonText() {
      if (this.refundInProgress) return "claiming refund ...";
      return "Claim refund";
    },
  },
  methods: {
    ...mapActions("refund", ["claimRefund", "checkHasRefunded"]),
  },
  watch: {
    myBots(newval) {
      console.log(newval);
      if (newval.length > 0) this.checkHasRefunded(newval);
    },
  },
};
</script>
