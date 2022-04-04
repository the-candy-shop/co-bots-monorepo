<template>
  <button
    class="rounded-xl bg-sky-400 text-white font-black w-[320px] h-[64px] text-[20px] leading-5 pt-6 pb-5 uppercase"
    :class="{ 'opacity-50': disabled, 'cursor-not-allowed': disabled }"
    @click="localClick"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: "cbButton",
  emits: ["click"],
  props: {
    click: Function,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    localClick() {
      if (!this.disabled) this.$emit("click");
    },
  },
};
</script>
