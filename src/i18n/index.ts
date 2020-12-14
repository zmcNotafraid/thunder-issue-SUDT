import { createI18n } from 'vue-i18n'
import type { I18n, Locale, I18nOptions, Composer } from 'vue-i18n'

export function setupI18n(options: I18nOptions = { locale: 'en-US' }): I18n {
  const i18n = createI18n(options) as I18n
  setI18nLanguage(i18n, options.locale!)
  return i18n
}

export function setI18nLanguage(i18n: I18n, locale: Locale): void {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    ((i18n.global as unknown) as Composer).locale.value = locale
  }
}

export async function loadLocaleMessages(i18n: I18n, locale: Locale): Promise<void> {
  // load locale messages
  if (!i18n.global.availableLocales.includes(locale)) {
    const messages = await import(`./locales/${locale}.ts`)
    i18n.global.setLocaleMessage(locale, messages.default)
  }
}
