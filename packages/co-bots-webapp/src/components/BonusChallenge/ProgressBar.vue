<template>
  <div class="w-full h-10 bg-cobots-silver rounded-full relative text-md sm:text-xl">
    <div 
      class="absolute h-10 rounded-full leading-none"
      :class="bgColor"
      :style="{'width': width, 'minWidth': '2.5rem'}"
    >
    </div>
    <div class="uppercase font-black text-white absolute h-full left-4">
      <div class="flex items-center text-center h-full">
        {{progressString}} {{color}} bots
      </div>
    </div>

    <div class="uppercase font-black text-black absolute h-full right-4">
      <div class="flex items-center text-center h-full">
        {{totalString}}
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ProgressBar',
  props: {
    total: Number,
    progress: Number,
    bgColor: String,
    color: String,
  },
  computed: {
    width() {
      var val = this.progress/this.total * 100
      val = val > 100 ? 100 : val
      val = val < 1 ? 1 : val
      return `${(val).toFixed(0)}%`
    },
    bgClass() {
      return `bg-${this.color === 'red' ? 'cobots-red' : 'sky-400'}`
    },
    progressString() {
      if(this.progress) return this.progress.toLocaleString("en-US")
      return ''
    },
    totalString() {
      if(this.total) return this.total.toLocaleString("en-US")
      return ''
    },
  },
}
</script>