<template>
  <div>
    <div class="flex flex-row relative">
      <div class="flex flex-col justify-center w-24 border-x-[6px]"
          :class="{
            'h-4': small,
            'h-12': medium,
            'h-24': large,
            'h-[120px]': mlarge,
            'h-48': xlarge,
            'bg-cobots-silver-4 border-cobots-silver-2': true,
          }"
      >
      </div>      
      <div class="flex flex-col justify-center w-24 border-x-[6px] absolute left-0 top-0"
          :class="{
            'h-4': small,
            'h-12': medium,
            'h-24': large,
            'h-[120px]': mlarge,
            'h-48': xlarge,
            'bg-cobots-green border-cobots-green-3': true,
          }"
          :style="{height:(totalSupply < percentage ? 0 : getCompletionState(parseInt(percentage) - percentageToSpace[percentage][0], parseInt(percentage) + percentageToSpace[percentage][1], totalSupply)) + '%'}"
      >
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getCompletionState } from "@/services/mintCompletion.service";

export default {
   name: 'GaugeSeparator',
   props: {
      small: Boolean,
      medium: Boolean,
      large: Boolean,
      mlarge: Boolean,
      xlarge: Boolean,
      percentage: String,
    },
    computed: {
    ...mapGetters("mint", ["totalSupply"]),
  },
  data() {
    return {
      percentageToSpace: {
        150: [5, 5],
        250: [5, 5],
        350: [5, 55],
        450: [5, 5],
        625: [20, 20],
        875: [20, 20],
        1250: [100, 100],
        1750: [100, 100],
        2500: [250, 250],
        3500: [250, 250],
        4500: [250, 250],
        5500: [250, 250],
        6500: [250, 250],
        7500: [250, 250],
        8500: [250, 250],
        9500: [250, 250],
      },
    };
  },
  methods: {
    getCompletionState,
    filled() {
      return this.totalSupply >= parseInt(this.percentage);
    },
  },
}
</script>