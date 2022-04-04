<template>
  <div class="flex flex-col justify-center items-center flex-grow">
    <cb-button :disabled="connecting" @click="openModal" class="mb-4">
      {{ buttonText }}
    </cb-button>
    <scroll-label>
      <text class="text-cobots-silver-2">scroll down for info.</text>
    </scroll-label>
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
      return "Connect";
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
