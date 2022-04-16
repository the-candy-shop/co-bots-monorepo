<template>
  <div>
    <div class="flex flex-row">
      <div class="flex flex-col justify-center w-24 h-36 bg-cobots-silver-4 border-cobots-silver-2 border-x-4">
        <div class="h-1 bg-cobots-silver-6 text-cobots-silver-5 relative text-center">
          <div class="mt-[-13px] font-extrabold text-2xl">{{ percentage }}</div>
        </div>
      </div>
      <div class="w-[344px] h-[144px] bg-cobots-silver-7 ml-6 rounded-3xl p-4 flex flex-row opacity-50">
        <div class="flex flex-col justify-center items-center w-[120px] h-[120px] p-1.5 border-cobots-silver-2 border-4 border-dashed rounded-3xl">
          <img
            v-if="tokenURI"
            :src="tokenURI"
            class="rounded-2xl bg-white"
            @load="onImageLoad"
          />
          <div class="font-['CheeseButterCream'] text-[24px] leading-[24px]" v-else>
            ???
          </div>
        </div>
        <div class="flex flex-col justify-center items-center grow">
          <div class="font-extrabold text-base text-cobots-silver-2">RANDOM DRAW</div>
          <div class="font-['CheeseButterCream'] text-[56px] leading-[56px] mt-2 flex flex-row">
            <div class="mr-3 text-[60px] leading-[60px]">{{ eth }}</div>
            <div>ETH</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
   name: 'GaugeStack',
   props: {
    percentage: String,
    eth: String,
    bots: Boolean
  },
  data() {
    return {
      imgUrl: null,
      canvas: document.createElement("canvas"),
      context: null,
    };
  },
  computed: {
    ...mapGetters("bots", ["imageByIndex", "colorByIndex", "flipInProgress"]),
    tokenURI() {
      return this.imageByIndex(1);
    },
  }
}
</script>