import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

sessionStorage.removeItem('token')
sessionStorage.removeItem('user')

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')