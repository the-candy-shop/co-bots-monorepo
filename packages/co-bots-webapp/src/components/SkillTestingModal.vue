<template>
  <div
    class="fixed top-0 left-0 bg-black bg-opacity-50 w-screen h-screen"
  >
    <div class="flex flex-col w-full h-full justify-center items-center">
      <div class="bg-cobots-silver rounded-xl p-4 flex flex-col w-[400px] items-center">
        <div class="font-black text-center mb-2 text-[20px] leading-[24px]">
          To enter the Extravagainza, first solve this equation without a calculator.
        </div>
        <div class="w-[120px] border-cobots-silver-2 border-[1px] my-[20px]"></div>
        <div class="text-[16px] leading-[20px] font-bold text-center w-[336px] text-cobots-silver-3 mb-[20px]">What is 512 divided by 128, then multiplied by 1024, minus 4094?</div>
        <input autofocus v-model="answer" class="outline-none text-center rounded-[16px] h-[96px] w-[368px] text-[84px] leading-[84px] pt-[20px] font-['CheeseButterCream']" />

        <cb-button
          class="mt-[12px]"
          @click="validateAnswer"
          :disabled="answer != 2"
        >
          PROCEED TO MINT
        </cb-button>

        <div class="text-cobots-silver-3 text-[14px] leading-[14px] mt-[16px]">View the Contest Rules <router-link to="/rules" class="underline">here</router-link>.</div>
      </div>
    </div>
  </div>
</template>

<script>
import cbButton from "./shared/cbButton.vue";

export default {
  name: "SkillTestingModal",
  components: {
    cbButton,
  },
  data() {
    return {
      answer: null,
    };
  },
  methods: {
    validateAnswer() {
      localStorage.setItem("answer", 2)
      this.$emit('close')
    },
  },
  emits: ["close"],
};
</script>
