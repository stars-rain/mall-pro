import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
]

const router = createRouter({
  // linkExactActiveClass: 'active',
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
