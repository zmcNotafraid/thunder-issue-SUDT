import { createApp } from 'vue'
import App from './App.vue'
import { setupRouter } from './router'
import { setupI18n } from './i18n'
import en from './i18n/locales/en'
import zh from './i18n/locales/zh'
import 'moment'
import {
  Layout,
  Menu,
  Button,
  Form,
  Input,
  Row,
  Col,
  Checkbox,
  Space,
  Descriptions,
  Divider,
  Spin,
  Modal,
  Dropdown,
  InputNumber
} from 'ant-design-vue'

const app = createApp(App)
const i18n = setupI18n({
  globalInjection: true,
  missingWarn: true,
  legacy: false,
  locale: "en",
  messages: {
    en,
    zh
  }
})
const router = setupRouter(i18n)

app.use(Layout)
app.use(Menu)
app.use(Button)
app.use(Form)
app.use(Input)
app.use(InputNumber)
app.use(Row)
app.use(Col)
app.use(Checkbox)
app.use(Space)
app.use(Descriptions)
app.use(Divider)
app.use(Spin)
app.use(Modal)
app.use(Dropdown)

app.use(i18n)
app.use(router)

app.mount("#app")
