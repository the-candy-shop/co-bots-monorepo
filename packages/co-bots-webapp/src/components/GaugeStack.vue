<template>
  <div>
    <div class="flex flex-row relative">
      <div class="flex flex-col justify-center w-24 h-36 border-x-[6px] bg-cobots-silver-4 border-cobots-silver-2"
          :class="{
            'h-36': configuration[percentage].contests.length === 1 && configuration[percentage].contests[0].winners === 1,
            'h-[198px]': configuration[percentage].contests.length === 1 && configuration[percentage].contests[0].winners === 5,
            'h-[304px]': configuration[percentage].contests.length === 2,
          }"
      >
        <div class="h-1 relative text-center bg-cobots-silver-6">
          <div v-if="percentage != 10000" class="mt-[-13px] font-extrabold text-2xl text-cobots-silver-5">{{ percentage }}</div>
          <div v-else class="mt-[-13px] font-extrabold text-2xl text-cobots-silver-5">10k</div>
        </div>
      </div>
      <div class="absolute left-0 top-0 flex flex-col justify-center w-24 h-36 border-x-[6px] bg-cobots-green border-cobots-green-3"
          :class="{
            'h-36': configuration[percentage].contests.length === 1 && configuration[percentage].contests[0].winners === 1,
            'h-[198px]': configuration[percentage].contests.length === 1 && configuration[percentage].contests[0].winners === 5,
            'h-[304px]': configuration[percentage].contests.length === 2,
          }"
          :style="{height:getCompletionState(parseInt(percentage) - 45, parseInt(percentage) + 45, totalSupply) + '%'}"
      >
      </div>
      <div class="absolute inset-y-1/2 h-1 w-24 text-center"
          :class="{
            'bg-cobots-green-3': false
          }"
      >
        <div v-if="parseInt(totalSupply) >= parseInt(percentage)">
          <div v-if="percentage != 10000" class="mt-[-13px] font-extrabold text-2xl text-white">{{ percentage }}</div>
          <div v-else class="mt-[-13px] font-extrabold text-2xl text-white">10k</div>
        </div>
      </div>

      <div class="flex flex-row">
        <div v-if="configuration[percentage].contests.length === 1" class="w-[20px] flex justify-end items-center">
          <div class="w-[0px] h-[0px] border-r-[12px] border-cobots-silver-7" style="border-top:12px solid transparent;border-bottom:12px solid transparent"
              :class="{
               'opacity-50': contestFulfillmentIndexes.length === 0,
              }"
          ></div>
        </div>
        <div v-if="configuration[percentage].contests.length === 2" class="w-[20px] flex flex-col items-end justify-center">
          <div class="w-[0px] h-[0px] border-r-[12px] border-cobots-silver-7" style="border-top:12px solid transparent"
              :class="{
               'opacity-50': contestFulfillmentIndexes.length === 0,
              }"
          ></div>
          <div class="w-[0px] h-[0px] border-r-[12px] border-cobots-silver-7 mt-[8px]" style="border-bottom:12px solid transparent"
              :class="{
               'opacity-50': contestFulfillmentIndexes.length === 0,
              }"
          ></div>
        </div>
        <div class="flex flex-col justify-center">
          <div v-for="(contest, index) in configuration[percentage].contests" :key="contest.price" class="w-[233px] md:w-[344px] bg-cobots-silver-7 pl-[12px] rounded-3xl flex flex-row justify-center items-center"
            :class="{
              'first:mb-2': configuration[percentage].contests.length === 2,
              'opacity-50': contestFulfillmentIndexes.length === 0,
              'h-[104px] md:h-[144px]': contest.winners === 1,
              'h-[144px] md:h-[198px]': contest.winners === 5,
              'rounded-bl-none': configuration[percentage].contests.length === 2 && index === 0,
              'rounded-tl-none': configuration[percentage].contests.length === 2 && index === 1,
            }"
          >
            <div v-if="contest.winners === 5" class="flex flex-row flex-wrap w-[80px] h-[114px] md:w-[120px] md:h-[174px] p-1 border-cobots-silver-2 border-[3px] border-dashed rounded-[16px]">
              <div v-for="n in [0,1,2,3,4]" :key="n" class="flex justify-center items-center w-[33px] h-[33px] md:w-[52px] md:h-[52px]">
                <a target="_blank" v-if="contestFulfillmentIndexes.length > n" :href="openseaLink(winnerIndexByFulfillmentIndex(contestFulfillmentIndexes[n]))">
                  <img
                    :src="winnerImageByFulfillmentIndex(contestFulfillmentIndexes[n])"
                    class="rounded-[8px] bg-white w-[30px] h-[30px] md:w-[48px] md:h-[48px]"
                    @load="onImageLoad"
                  />
                </a>
                <div class="flex justify-center items-center font-['CheeseButterCream'] text-[12px] leading-[12px] md:text-[16px] md:leading-[16px] w-[30px] h-[30px] md:w-[48px] md:h-[48px] rounded-[8px] bg-cobots-silver-3 pt-[4px] md:pt-0" v-else>
                  ???
                </div>
              </div>
            </div>

            <div v-if="contest.winners === 1" class="flex flex-col justify-center items-center w-[80px] :h-[80px] md:w-[120px] md:h-[120px] p-1.5 border-cobots-silver-2 border-[3px] border-dashed rounded-[16px]">
              <a target="_blank" v-if="contestFulfillmentIndexes.length !== 0" :href="openseaLink(winnerIndexByFulfillmentIndex(contestFulfillmentIndexes[index]))">
                <img
                  :src="winnerImageByFulfillmentIndex(contestFulfillmentIndexes[index])"
                  class="rounded-[8px] bg-white"
                  @load="onImageLoad"
                />
              </a>
              <div class="flex justify-center items-center font-['CheeseButterCream'] text-[24px] leading-[24px] w-[64px] h-[64px] md:w-[102px] md:h-[102px] rounded-[8px] bg-cobots-silver-3" v-else>
                ???
              </div>
            </div>
            <div class="flex flex-col justify-center grow pl-[10px] md:pl-[18px]">
              <div class="font-extrabold text-[12px] leading-[12px] md:text-base md:leading-normal text-cobots-silver-2"
                  :class="{
                    'text-gold': contest.highlight !== false,
                    'pt-[13px]': contest.winners === 1,
                    'pt-[0px]': contest.winners === 5,
                    'line-through': contest.price === 50,
                  }"
              >{{ contest.contest }}</div>
              <div v-if="contest.price === 50" class="font-extrabold text-[8px] leading-[8px] md:text-[10px] md:leading-[10px] text-white"
              >SOLVED ON 2022-05-30 by meuleman.eth</div>

              <div class="font-['CheeseButterCream'] text-[36px] leading-[36px] mt-[8px] md:mt-[2px] md:text-[56px] md:leading-[56px] flex flex-row">
                <div class="mr-3 text-[40px] leading-[40px] md:text-[60px] md:leading-[60px]"
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
              <div v-if="contest.winners === 5" class="mt-[-4px] text-[12px] leading-[12px] md:text-[16px] md:leading-[16px] font-extrabold uppercase">{{ contest.subPrice }} ETH/winner</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { prizeConfiguration, contestHighlights, contestTypes } from "@/services/prizeConfiguration";
import { getCompletionState } from "@/services/mintCompletion.service";

export default {
   name: 'GaugeStack',
   props: {
    fulfillments: Array,
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
      contestTypes,
    };
  },
  computed: {
    ...mapGetters("bots", ["imageByIndex", "colorByIndex", "flipInProgress"]),
    ...mapGetters("mint", ["totalSupply", "orderedFulfillments", "winnerImageByFulfillmentIndex", "winnerIndexByFulfillmentIndex"]),
    contestFulfillmentIndexes() {
      var indexes = [], i;
      for (i = 0; i < this.orderedFulfillments.length; i++) {
          if (this.orderedFulfillments[i].fulfilled && this.orderedFulfillments[i].prize.checkpoint == this.percentage) {
            indexes.push(i);
            this.getWinnerImageForFulfillmentIndex(i);
          }
      }
      
      return indexes;
    },
  },
  methods: {
    ...mapActions("mint", [
      "getWinnerImageForFulfillmentIndex",
    ]),
    getCompletionState,
    openseaLink(index) {
      const { VITE_OPENSEA_BASE_URL, VITE_CONTRACT_ADDRESS } = import.meta.env;
      let link = `${VITE_OPENSEA_BASE_URL}${VITE_CONTRACT_ADDRESS}/${index}`;
      return link;
    },
  },
}
</script>