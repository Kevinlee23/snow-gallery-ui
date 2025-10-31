import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './plugins/tailwind/index.css'
// import './plugins/font/lxgw.css'
import './plugins/font/LXGWWenKai-Regular/result.css'
import './plugins/font/LXGWWenKai-Medium/result.css'
import './style.css'
import 'vue-sonner/style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(VueQueryPlugin)
app.use(router)
app.mount('#app')
