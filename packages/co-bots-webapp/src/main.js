import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import './tailwind.css'
import App from './App.vue'
import store from './store'
import VueScrollTo from "vue-scrollto"
import Home from './views/Home.vue' 
import Faq from './pages/Faq.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/faq', component: Faq },
]

const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
})

const app = createApp(App)

app.use(store)
app.use(router)
app.use(VueScrollTo)
app.mount('#app')
