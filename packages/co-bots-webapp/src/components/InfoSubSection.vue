<template>
  <div class="py-10">
    <div class="font-extrabold mb-4 text-xl leading-5 text-white">{{ question }}</div>
    <div class="space-y-4 text-zinc-300 leading-6 text-[16px]">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
   name: 'InfoSubSection',
   props: {
     question: String
   }
}
</script>