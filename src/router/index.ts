import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../views/Auth.vue'
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
    }
  ]
})

export default router
