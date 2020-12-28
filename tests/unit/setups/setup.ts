import { config } from "@vue/test-utils"
import { setupI18n } from "@/i18n/index"
import en from '@/i18n/locales/en'

const i18n = setupI18n({
  globalInjection: true,
  missingWarn: true,
  legacy: false,
  locale: "en",
  messages: {
    en
  }
})

config.global.mocks.$t = (key: string) => i18n.global.t(key)
