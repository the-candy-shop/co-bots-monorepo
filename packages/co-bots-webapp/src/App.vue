<template>
  <div>
    <div
      v-if="siteClosed"
      class="w-screen h-screen flex flex-col justify-center items-center"
    ></div>
    <div v-else>
      <header-vue />
      <main>
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import HeaderVue from "@/components/Header/index.vue";
import Home from "./views/Home.vue";
const { VITE_SITE_CLOSED } = import.meta.env;
export default {
  name: "App",
  components: {
    HeaderVue,
    Home,
  },
  data: () => ({
    closed: VITE_SITE_CLOSED,
  }),
  computed: {
    siteClosed() {
      if (this.closed == "true") return true;
      return false;
    },
  },
};
</script>
