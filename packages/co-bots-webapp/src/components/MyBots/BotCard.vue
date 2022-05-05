<template>
  <div
    class="bg-black border-2 p-2 border-cobots-silver-3 rounded-2xl space-y-2"
  >
    <div
      class="bg-white text-black rounded-lg w-52 h-52 flex justify-center items-center"
    >
      <img
        v-if="tokenURI"
        :src="tokenURI"
        class="rounded-lg"
        @load="onImageLoad"
      />
    </div>

    <button
      v-if="canFlip && botColor"
      class="w-full py-3 rounded-lg uppercase font-black text-sm"
      :class="{
        'bg-cobots-red': botColor === 'blue',
        'bg-sky-400': botColor === 'red',
        'cursor-not-allowed': flipInProgress,
        'opacity-50': flipInProgress,
      }"
      @click="toggleBotColor(index)"
    >
      {{ flipButtonText }}
    </button>

    <div class="grid grid-cols-2 gap-[8px]">
      <a
        :href="openseaLink"
        target="_blank"
        class="bg-cobots-silver text-black text-sm leading-[14px] pt-[14px] pb-[12px] rounded-lg uppercase font-black flex items-center justify-center"
      >
        <TwitterLogo class="fill-black w-5 mr-[4px]" />
        share
      </a>
      <button
        @click="download"
        class="bg-cobots-silver text-black text-sm leading-[14px] pt-[14px] pb-[12px] rounded-lg uppercase font-black"
      >
        save
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import TwitterLogo from "../TwitterLogo.vue";
export default {
  name: "BotCard",
  components: {
    TwitterLogo,
  },
  data() {
    return {
      imgUrl: null,
      canvas: document.createElement("canvas"),
      context: null,
    };
  },
  props: {
    index: Number,
  },
  computed: {
    ...mapGetters("bots", ["imageByIndex", "colorByIndex", "flipInProgress"]),
    ...mapGetters("contractState", ["canFlip"]),
    tokenURI() {
      return this.imageByIndex(this.index);
    },
    botColor() {
      return this.colorByIndex(this.index);
    },
    flipButtonText() {
      if (this.botColor === "red") return "Flip to blue";
      return "Flip to red";
    },
    openseaLink() {
      const text = "Got my ticket to @thecobots 300 ETH on-chain giveaway event 🍾"
      
      return `https://twitter.com/intent/tweet?text=${text}`
    },
  },
  methods: {
    ...mapActions("bots", [
      "getImageForIndex",
      "getBotColor",
      "toggleBotColor",
    ]),
    onImageLoad(e, f, g) {
      this.context.drawImage(e.target, 0, 0, 450, 450);
    },
    download() {
      let a = document.createElement("a");
      let url = this.canvas.toDataURL();
      a.download = `co-bot-${this.index}.png`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    },
  },
  mounted() {
    this.canvas.width = 450;
    this.canvas.height = 450;
    this.context = this.canvas.getContext("2d");
    this.getImageForIndex(this.index);
  },
};
</script>
