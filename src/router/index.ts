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
  },
  {
    /* 首页 */
    name: 'index',
    path: '/',
    component: () => import('@/views/index.vue'),
    meta: {
      title: '小米商城',
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
  },
  {
    name: 'reglog',
    path: '/reglog/:title',
    component: () => import('@/views/login/index.vue'),
    props: (route) => ({ title: route.params.title }),
  },
  {
    // 购物车页面
    name: 'cart',
    path: '/cart',
    component: () => import('@/views/cart/cart.vue'),
    meta: {
      title: '购物车'
    },
  },
  {
    // 我的收藏页面
    name: 'collect',
    path: '/collect',
    component: () => import('@/views/collect/index.vue'),
    meta: {
      title: '我的收藏'
    },
    children: [
      {
        name: 'collectPage',
        path: 'index',
        component: () => import('@/views/collect/content.vue'),
        props: (route) => ({ page: route.query.page }),
      },
    ],
  },
  {
    // 订单页面
    name: 'order',
    path: '/order',
    component: () => import('@/views/order/index.vue'),
    meta: {
      title: '历史订单'
    },
  },
]

const router = createRouter({
  // linkExactActiveClass: 'active',
  history: createWebHistory(process.env.BASE_URL),
  routes,
  /* scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }, */
})

router.beforeEach((to): void => {
  if (to.params.title === 'login') to.meta.title = '登录';
  else if (to.params.title === 'register') to.meta.title = '注册'
  // 进入该路由前改变文档标题
  document.title = to.meta.title;
})

export default router