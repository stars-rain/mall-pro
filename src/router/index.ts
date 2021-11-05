import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    /* 404页面 */
    name: '404',
    path: '/:routePath(.+)+',
    component: () => import('@/views/404.vue'),
    meta: {
      title: '404',
    },
    beforeEnter(to) {
      // 进入该路由前改变文档标题
      document.title = to.meta.title;
    },
  },
  {
    /* 首页 */
    name: 'index',
    path: '/',
    component: () => import('@/views/index.vue'),
    meta: {
      title: '小米商城',
    },
    beforeEnter(to) {
      // 进入该路由前改变文档标题
      document.title = to.meta.title;
    },
  },
  // 商品详情页
  {
    name: 'detailsPage',
    path: '/detailsPage/:title',
    component: () => import('@/views/detailsPage/detailsPage.vue'),
    props: (route) => ({ id: route.query.id, title: route.params.title }),
    meta: {
      title: '商品详情',
    },
    beforeEnter(to) {
      // 进入该路由前改变文档标题
      document.title = to.meta.title;
    },
  },
  {
    name: 'reglog',
    path: '/reglog/:title',
    component: () => import('@/views/login/index.vue'),
    props: (route) => ({ title: route.params.title }),
    beforeEnter(to) {
      // 判断用户是进行注册还是登录以便改变文档的title
      switch (to.params.title) {
        case 'login': to.meta.title = '登录'; break;
        case 'register': to.meta.title = '注册'; break;
      }
      // 进入该路由前改变文档标题
      document.title = to.meta.title;
    },
  },
]

const router = createRouter({
  // linkExactActiveClass: 'active',
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

export default router