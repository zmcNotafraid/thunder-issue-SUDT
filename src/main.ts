import { createApp } from 'vue'
import App from './App.vue'
import 'moment'
import { Layout, Menu, Button, Form } from 'ant-design-vue'

const app = createApp(App)

app.use(Layout)
app.use(Menu)
app.use(Button)
app.use(Form)

app.mount("#app")
