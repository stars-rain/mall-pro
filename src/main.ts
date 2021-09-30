import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import SvgIcon from '@/components/svgIcon/index.vue'// svg组件
import {
  // create naive ui
  create,
  // component
  NButton,
  NDivider
} from 'naive-ui'
import $axios from "@/plugins/axios"

const native = create({
  components: [
    NButton,
    NDivider
  ],
});

createApp(App).component('svg-icon', SvgIcon).use(store).use(router).use(native).use($axios).mount('#app')

/* 处理.svg文件 */
const requireAll = (requireContext: any) => requireContext.keys().map(requireContext) //定义的一个遍历函数后面会调用
/* require.context是node的文件加载函数第一个参数是指定的文件路径，
‘./’这个是当前文件路径第二个参数一般默认false就可以了大多数都用不到，
第三个参数是正则匹配你要加载的文件类型 */
const req: __WebpackModuleApi.RequireContext = require.context('@/assets/icons', false, /\.svg$/)
requireAll(req)