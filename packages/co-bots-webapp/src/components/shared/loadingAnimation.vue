<template>
  <div class="w-full flex justify-center items-center">
    <div class="flex w-[36px] items-center">
      <transition
        enter-active-class="duration-200 ease-out"
        enter-from-class="transform opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="transform opacity-0"
      >
        <img
          v-if="dotCount == 0"
          src="../../images/1dot.svg"
          class="absolute"
        />
        <img
          v-else-if="dotCount == 1"
          src="../../images/2dots.svg"
          class="absolute"
        />
        <img
          v-else-if="dotCount == 2"
          src="../../images/3dots.svg"
          class="absolute"
        />
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoadingAnimation",
  data: () => ({
    dotCount: 0,
    interval: null,
  }),
  methods: {
    increment() {
      if (this.dotCount > 2) this.dotCount = 0;
      else this.dotCount += 1;
    },
  },
  mounted() {
    this.interval = setInterval(() => {
      this.increment();
    }, 400);
  },
  beforeUnMount() {
    clearInterval(this.interval);
  },
};
</script>
