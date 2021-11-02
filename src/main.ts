import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store, { key } from './store'
import SvgIcon from '@/components/svgIcon/index.vue'// svg组件
import {
  create,
} from 'naive-ui'
import $axios from "./plugins/axios"
import $observer from "./plugins/observer"
import collapseTransiton from "./components/functionalComponents/collapseTransition"

const native = create({
  components: [
  ],
});

const app = createApp(App);

/* 注册svg图标组件和展开折叠动画组件 */
app.component('svg-icon', SvgIcon).component('collapse-transition', collapseTransiton);
app.use(store, key).use(router).use(native).use($axios).use($observer).mount('#app')

/* 处理.svg文件 */
const requireAll = (requireContext: any) => requireContext.keys().map(requireContext) //定义的一个遍历函数后面会调用
/* require.context是node的文件加载函数第一个参数是指定的文件路径，
‘./’这个是当前文件路径第二个参数一般默认false就可以了大多数都用不到，
第三个参数是正则匹配你要加载的文件类型 */
const req: __WebpackModuleApi.RequireContext = require.context('@/assets/icons', false, /\.svg$/)
requireAll(req)