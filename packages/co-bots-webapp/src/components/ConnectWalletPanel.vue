<template>
  <div :class="{
      'flex flex-col justify-center items-center flex-grow': !black,
      'text-white flex justify-between lg:justify-end items-center': black
    }">
    <cb-button v-if="!black" :disabled="connecting" @click="openModal" class="mb-4">
      {{ buttonText }}
    </cb-button>
    <button v-if="black" :disabled="connecting" @click="openModal" class="w-[160px] h-[40px] rounded-full border-2 border-zinc-300 px-4 ml-4 font-black">
      CONNECT
    </button>
    <ConnectWalletModal v-if="modalOpen" @close="closeModal" />
  </div>
</template>

<script>
import cbButton from "./shared/cbButton.vue";
import scrollLabel from "./shared/scrollLabel.vue";
import ConnectWalletModal from "./ConnectWalletModal.vue";
import { mapGetters } from "vuex";

export default {
  name: "ConnectWalletPanel",
  props: {
    black: Boolean
  },
  components: {
    cbButton,
    scrollLabel,
    ConnectWalletModal,
  },
  data() {
    return {
      connecting: false,
      modalOpen: false,
    };
  },
  computed: {
    buttonText() {
      if (this.connecting) return "connecting...";
      return "Connect Wallet";
    },
    ...mapGetters("layout", ["headerHeight"]),
  },
  methods: {
    openModal() {
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
    },
  },
};
</script>
