import { createRouter, createWebHistory } from 'vue-router'
import type { Router, RouteRecordRaw } from 'vue-router'
import { setI18nLanguage, loadLocaleMessages } from '../i18n'
import type { I18n, Locale } from 'vue-i18n'
import Auth from '../views/Auth.vue'
import Burn from '../views/Burn.vue'
import Info from '../views/Info.vue'
import Issue from '../views/Issue.vue'
import Transfer from '../views/Transfer.vue'

export function setupRouter(i18n: I18n): Router {
  const SUPPORT_LOCALES = ['en-US', 'zh-CN']

  const routes: RouteRecordRaw[] = [
    {
      path: '/',
      component: Auth
    },
    {
      path: '/issue',
      component: Issue
    },
    {
      path: '/transfer',
      component: Transfer
    },
    {
      path: '/info',
      component: Info
    },
    {
      path: '/burn',
      component: Burn
    }
  ]
  const router = createRouter({
    history: createWebHistory(),
    routes: routes
  })

  router.beforeEach((to, from, next) => {
    const locale = localStorage.getItem("locale") || "en-US" as Locale

    // check locale
    if (!SUPPORT_LOCALES.includes(locale)) {
      return false
    }

    // load locale messages
    loadLocaleMessages(i18n, locale)

    // set i18n language
    setI18nLanguage(i18n, locale)

    return next()
  })

  return router
}
