<template>
  <div
    class="w-40 h-40 rounded-lg border-dashed border-2 border-cobots-silver flex flex-col justify-center items-center"
  >
    <img v-if="botImage" :src="botImage" class="rounded-lg" />
    <div
      v-else
      class="text-cobots-silver-2 font-black text-[14px] leading-[16px]"
    >
      NOT YET <br />
      DRAWN
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
export default {
  name: "WinnerCard",
  props: {
    index: Number,
    bonus: Boolean,
  },
  computed: {
    ...mapGetters("prizes", [
      "botByTokenIndex",
      "mainWinnerByIndex",
      "bonusWinnersByIndex",
    ]),
    tokenId() {
      if (this.bonus) return this.bonusWinnersByIndex(this.index)?.tokenId;
      return this.mainWinnerByIndex(this.index)?.tokenId;
    },
    botImage() {
      return this.botByTokenIndex(this.tokenId);
    },
  },
  methods: {
    ...mapActions("prizes", ["getBotForTokenIndex"]),
  },
  mounted() {
    if (this.tokenId) this.getBotForTokenIndex(this.tokenId);
  },
};
</script>
