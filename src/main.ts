import { createApp } from 'vue'
import App from './App.vue'
import { Layout, Menu } from 'ant-design-vue'

const app = createApp(App)
app.use(Layout)
app.use(Menu)
app.mount("#app")
