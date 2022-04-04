<template>
  <div class="flex items-center px-2">
    <p class="text-cobots-silver-2 mr-1">{{ labelString }}:</p>
    <p class="font-black text-white" :class="{ 'text-cobots-red': !canMint }">
      {{ timeLeftString }}
    </p>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "CountDown",
  computed: {
    ...mapGetters("contractState", [
      "now",
      "mintEndDate",
      "canMint",
      "canFlip",
      "flipEndDate",
    ]),
    timeLeft() {
      if (this.canMint) {
        let newVal = this.mintEndDate - this.now;
        return newVal > 0 ? newVal : 0;
      }
      if (this.canFlip) {
        let newVal = this.flipEndDate - this.now;
        return newVal > 0 ? newVal : 0;
      }
      return 0;
    },
    timeLeftString() {
      if (this.timeLeft === null) return "--:--:--";
      var msec = this.timeLeft;
      var hh = Math.floor(msec / 1000 / 60 / 60);
      msec -= hh * 1000 * 60 * 60;
      var mm = Math.floor(msec / 1000 / 60);
      msec -= mm * 1000 * 60;
      var ss = Math.floor(msec / 1000);
      if (hh < 10) hh = `0${hh}`;
      if (mm < 10) mm = `0${mm}`;
      if (ss < 10) ss = `0${ss}`;
      return `${hh}:${mm}:${ss}`;
    },
    labelString() {
      if (this.canMint) return "TIME LEFT";
      return "TIME UNTIL RAFFLE";
    },
  },
};
</script>
