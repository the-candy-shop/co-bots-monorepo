<template>
  <div>
    <div class="flex flex-row relative">
      <div class="flex flex-col justify-center w-24 h-36 border-x-[6px] bg-cobots-silver-4 border-cobots-silver-2"
          :class="{
            'h-36': configuration[percentage].contests.length === 1,
            'h-[304px]': configuration[percentage].contests.length === 2,
          }"
      >
        <div class="h-1 relative text-center bg-cobots-silver-6">
          <div class="mt-[-13px] font-extrabold text-2xl text-cobots-silver-5">{{ percentage }}</div>
        </div>
      </div>
      <div class="absolute left-0 top-0 flex flex-col justify-center w-24 h-36 border-x-[6px] bg-cobots-green border-cobots-green-3"
          :class="{
            'h-36': configuration[percentage].contests.length === 1,
            'h-[304px]': configuration[percentage].contests.length === 2,
          }"
          :style="{height:getCompletionState(parseInt(percentage) - percentageToSpace[percentage][0], parseInt(percentage) + percentageToSpace[percentage][1], totalSupply) + '%'}"
      >
      </div>
      <div class="absolute inset-y-1/2 h-1 w-24 text-center"
          :class="{
            'bg-cobots-green-3': false
          }"
      >
        <div class="mt-[-13px] font-extrabold text-2xl text-white">{{ percentage }}</div>
      </div>

      <div class="flex flex-col">
        <div v-for="contest in configuration[percentage].contests" :key="contest.price" class="w-[344px] h-[144px] bg-cobots-silver-7 ml-6 rounded-3xl p-4 flex flex-row opacity-50"
          :class="{
            'first:mb-4': configuration[percentage].contests.length === 2,
          }"
        >
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
            <div class="font-extrabold text-base text-cobots-silver-2"
                :class="{
                  'text-gold': contest.highlight !== false,
                }"
            >{{ contest.contest }}</div>
            <div class="font-['CheeseButterCream'] text-[56px] leading-[56px] mt-2 flex flex-row">
              <div class="mr-3 text-[60px] leading-[60px]"
                  :class="{
                  'text-cobots-green': contest.highlight == contestHighlights.GREEN,
                  'text-cobots-red': contest.highlight == contestHighlights.RED,
                }"
              >{{ contest.price }}</div>
              <div :class="{
                  'text-cobots-green': contest.highlight == contestHighlights.GREEN,
                  'text-cobots-red': contest.highlight == contestHighlights.RED,
                }">ETH</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { prizeConfiguration, contestHighlights } from "@/services/prizeConfiguration";
import { getCompletionState } from "@/services/mintCompletion.service";

export default {
   name: 'GaugeStack',
   props: {
    percentage: String,
    bots: Boolean
  },
  data() {
    return {
      imgUrl: null,
      canvas: document.createElement("canvas"),
      context: null,
      configuration: prizeConfiguration,
      contestHighlights,
      percentageToSpace: {
        100: [50, 50],
        200: [50, 50],
        300: [50, 50],
        400: [50, 50],
        500: [50, 50],
        750: [50, 50],
        1000: [50, 50],
        1500: [50, 50],
        2000: [50, 50],
        3000: [50, 50],
        4000: [50, 50],
        5000: [50, 50],
        6000: [50, 50],
        7000: [50, 50],
        8000: [50, 50],
        9000: [50, 50],
        10000: [50, 0],
      }
    };
  },
  computed: {
    ...mapGetters("bots", ["imageByIndex", "colorByIndex", "flipInProgress"]),
    ...mapGetters("mint", ["totalSupply"]),
    tokenURI() {
      return this.imageByIndex(1);
    },
  },
  methods: {
    getCompletionState
  },
}
</script>