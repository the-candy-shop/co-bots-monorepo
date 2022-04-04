<template>
  <div>
    <div class="flex justify-between text-sm sm:text-xl mb-4">
      <div class="font-black">BONUS PRIZES (2.5 ETH)</div>
      <div class="font-black text-cobots-silver-2">
        {{ bonusDrawCount }}/{{ bonusWinnersCount }} DRAWN
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
      <winner-card
        v-for="i in bonusWinnersCount"
        :key="i"
        :index="i - 1"
        bonus
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import WinnerCard from "./WinnerCard.vue";
export default {
  components: { WinnerCard },
  name: "BonusPrizes",
  computed: {
    ...mapGetters("prizes", [
      "bonusWinners",
      "bonusDrawCount",
      "bonusWinnersCount",
    ]),
  },
};
</script>
