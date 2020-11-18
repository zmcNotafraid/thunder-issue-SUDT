import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../views/Auth.vue'
import Burn from '../views/Burn.vue'
import Info from '../views/Info.vue'
import Issue from '../views/Issue.vue'
import Transfer from '../views/Transfer.vue'

const routerHistory = createWebHistory()
const router = createRouter({
  history: routerHistory,
  routes: [
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
})

export default router
