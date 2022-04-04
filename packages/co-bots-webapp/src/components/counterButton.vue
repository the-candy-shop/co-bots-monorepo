<template>
  <button
    class="rounded-full w-12 h-12 bg-zinc-300 text-3xl flex items-center justify-center"
    :class="{ 'opacity-50': disabled, 'cursor-not-allowed': disabled }"
    @click="localClick"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: "counterButton",
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
