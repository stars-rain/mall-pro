import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    /* 404页面 */
    name: 'NotFound',
    path: '/:routePath(.+)+',
    component: () => import('@/views/404.vue'),
  },
  {
    /* 首页 */
    name: 'index',
    path: '/',
    component: () => import('@/views/index.vue'),
  }
]

const router = createRouter({
  // linkExactActiveClass: 'active',
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
