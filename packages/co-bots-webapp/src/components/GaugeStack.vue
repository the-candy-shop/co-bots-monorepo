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
          :style="{height:getCompletionState(parseInt(percentage) - percentageToSpace[percentage][0], parseInt(percentage) + percentageToSpace[percentage][1], totalSupply) + '%'}"
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
        <div class="w-[24px] flex justify-end items-center">
          <div class="w-[0px] h-[0px] border-r-[14px] border-cobots-silver-7" style="border-top:17px solid transparent;border-bottom:17px solid transparent"
              :class="{
               'opacity-50': contestFulfillment === undefined, 
              }"
          ></div>
        </div>
        <div class="flex flex-col">
          <div v-for="contest in configuration[percentage].contests" :key="contest.price" class="w-[344px] bg-cobots-silver-7 pl-[12px] rounded-3xl flex flex-row justify-center items-center"
            :class="{
              'first:mb-4': configuration[percentage].contests.length === 2,
              'opacity-50': contestFulfillment === undefined,
              'h-[144px]': contest.winners === 1,
              'h-[198px]': contest.winners === 5,
            }"
          >
            <div v-if="contest.winners === 5" class="flex flex-row flex-wrap w-[120px] h-[174px] p-1 border-cobots-silver-2 border-[3px] border-dashed rounded-[16px]">
              <div v-for="n in [1,2,3,4,5]" :key="n" class="flex justify-center items-center w-[52px] h-[52px]">
                <img
                  v-if="contestFulfillment"
                  :src="winnerImageByFulfillmentIndex(fulfillmentIndex)"
                  class="rounded-[8px] bg-white"
                  @load="onImageLoad"
                />
                <div class="flex justify-center items-center font-['CheeseButterCream'] text-[16px] leading-[16px] w-[48px] h-[48px] rounded-[8px] bg-cobots-silver-3" v-else>
                  ???
                </div>
              </div>
            </div>

            <div v-if="contest.winners === 1" class="flex flex-col justify-center items-center w-[120px] h-[120px] p-1.5 border-cobots-silver-2 border-[3px] border-dashed rounded-[16px]">
              <img
                v-if="contestFulfillment"
                :src="winnerImageByFulfillmentIndex(fulfillmentIndex)"
                class="rounded-[8px] bg-white"
                @load="onImageLoad"
              />
              <div class="flex justify-center items-center font-['CheeseButterCream'] text-[24px] leading-[24px] w-[102px] h-[102px] rounded-[8px] bg-cobots-silver-3" v-else>
                ???
              </div>
            </div>
            <div class="flex flex-col justify-center grow pl-[18px]">
              <div class="font-extrabold text-base text-cobots-silver-2"
                  :class="{
                    'text-gold': contest.highlight !== false,
                    'pt-[13px]': contest.winners === 1,
                    'pt-[0px]': contest.winners === 5,
                  }"
              >{{ contest.contest }}</div>
              <div class="font-['CheeseButterCream'] text-[56px] leading-[56px] mt-[2px] flex flex-row">
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
              <div v-if="contest.winners === 5" class="mt-[-4px] text-[16px] leading-[16px] font-extrabold uppercase">{{ contest.subPrice }} ETH/winner</div>
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
      },
      fulfillmentIndex: -1
    };
  },
  computed: {
    ...mapGetters("bots", ["imageByIndex", "colorByIndex", "flipInProgress"]),
    ...mapGetters("mint", ["totalSupply", "orderedFulfillments", "winnerImageByFulfillmentIndex"]),
    contestFulfillment() {
      const fulfillmentIndex = this.orderedFulfillments.findIndex(
          (fulfillment) => fulfillment.fulfilled && fulfillment.prize.checkpoint == this.percentage
        );

      if (fulfillmentIndex === -1) {
        return undefined
      }

      this.fulfillmentIndex = fulfillmentIndex
      this.getWinnerImageForFulfillmentIndex(fulfillmentIndex);

      return this.orderedFulfillments[fulfillmentIndex]
    },
  },
  methods: {
    ...mapActions("mint", [
      "getWinnerImageForFulfillmentIndex",
    ]),
    getCompletionState,
  },
}
</script>