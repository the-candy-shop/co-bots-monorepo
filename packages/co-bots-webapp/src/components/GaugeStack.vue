<template>
  <div>
    <div class="flex flex-row">
      <div class="flex flex-col justify-center w-24 h-36 border-x-[6px]"
          :class="{
            'h-36': configuration[percentage].contests.length === 1,
            'h-[304px]': configuration[percentage].contests.length === 2,
            'bg-cobots-silver-4 border-cobots-silver-2': filled === 0,
            'bg-cobots-green border-cobots-green-3': filled !== 0,
          }"
      >
        <div class="h-1 relative text-center"
            :class="{
                'bg-cobots-silver-6': filled === 0,
                'bg-cobots-green': filled !== 0,
              }"
        >
          <div class="mt-[-13px] font-extrabold text-2xl"
              :class="{
                'text-cobots-silver-5': filled === 0,
                'text-white': filled !== 0,
              }"
          >{{ percentage }}</div>
        </div>
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
      filled: 0,
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