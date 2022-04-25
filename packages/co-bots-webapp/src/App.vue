<template>
  <div>
    <div
      v-if="siteClosed"
      class="w-screen h-screen flex flex-col justify-center items-center"
    ></div>
    <div class="pb-6" v-else>
      <header-vue />
      <main class='min-h-[calc(100vh-170px)]'>
        <router-view></router-view>
      </main>
      <div class="flex text-white justify-center mt-[100px] pb-6">
        <div><Logo class="fill-cobots-silver-2 w-[96px]" /></div>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from "@/components/logo.vue";
import HeaderVue from "@/components/Header/index.vue";
import Home from "./views/Home.vue";
const { VITE_SITE_CLOSED } = import.meta.env;
export default {
  name: "App",
  components: {
    HeaderVue,
    Home,
    Logo
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
