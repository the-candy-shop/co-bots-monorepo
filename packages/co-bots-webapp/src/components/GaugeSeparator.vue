<template>
  <div>
    <div class="flex flex-row">
      <div class="flex flex-col justify-center w-24 bg-cobots-silver-4 border-cobots-silver-2 border-x-4"
          :class="{
            'h-4': small,
            'h-12': medium,
            'h-24': large,
            'h-48': xlarge,
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
      xlarge: Boolean,
    },
  }
</script>