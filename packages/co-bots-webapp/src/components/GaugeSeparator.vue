<template>
  <div>
    <div class="flex flex-row">
      <div class="flex flex-col justify-center w-24 border-x-[6px]"
          :class="{
            'h-4': small,
            'h-12': medium,
            'h-24': large,
            'h-[120px]': mlarge,
            'h-48': xlarge,
            'bg-cobots-silver-4 border-cobots-silver-2': filled === 0,
            'bg-cobots-green border-cobots-green-3': filled !== 0,
          }"
      >
      </div>
    </div>
  </div>
</template>

<script>
export default {
   name: 'GaugeSeparator',
   props: {
      small: Boolean,
      medium: Boolean,
      large: Boolean,
      mlarge: Boolean,
      xlarge: Boolean,
    },
    data() {
      return {
        filled: 0,
      }
    },
  }
</script>