import { createApp } from 'vue'
import './tailwind.css'
import App from './App.vue'
import store from './store'
import VueScrollTo from "vue-scrollto"

const app = createApp(App)

app.use(store)
app.use(VueScrollTo)
app.mount('#app')
