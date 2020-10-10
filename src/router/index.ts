import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../views/Auth.vue'
import Issue from '../views/Issue.vue'

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
    }
  ]
})

export default router