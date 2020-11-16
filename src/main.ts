import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'moment'
import { Layout, Menu, Button, Form, Input, Row, Col, Checkbox } from 'ant-design-vue'

const app = createApp(App)

app.use(Layout)
app.use(Menu)
app.use(Button)
app.use(Form)
app.use(Input)
app.use(Row)
app.use(Col)
app.use(Checkbox)

app.use(router)

app.mount("#app")
