import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store, { key } from './store'
import SvgIcon from './components/svgIcon/index.vue'// svg组件
import loadingBar from "./components/ui-component/loadingBar.vue"
import {
  create,
  NAvatar,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NMessageProvider,
} from 'naive-ui'
import $axios from "./plugins/axios"
import $observer from "./plugins/observer"
import collapseTransiton from "./components/functionalComponents/collapseTransition"

const app: ReturnType<typeof createApp> = createApp(App);

const native: ReturnType<typeof create> = create({
  components: [
    NForm,
    NFormItem,
    NInput,
    NButton,
    NMessageProvider,
    NAvatar,
  ],
});

/**
 * 全局组件
 */
const globalComponent: Map<string, any> = new Map<string, any>([
  ['svg-icon', SvgIcon], // svg图片组件
  ['loading-bar', loadingBar], // 加载条组件
  ['collapse-transition', collapseTransiton], // 折叠展开动画组件
]);
for (const [k, v] of globalComponent.entries()) {
  app.component(k, v);
}

/**
 * 插件
 */
const globalPlugins = [store, router, native, $axios, $observer];
for (const value of globalPlugins) {
  if (value === store) app.use(value, key)
  else app.use(value)
}

app.mount('#app');

/* 处理.svg文件 */
const requireAll = (requireContext: any) => requireContext.keys().map(requireContext) //定义的一个遍历函数后面会调用
/* require.context是node的文件加载函数第一个参数是指定的文件路径，
‘./’这个是当前文件路径第二个参数一般默认false就可以了大多数都用不到，
第三个参数是正则匹配你要加载的文件类型 */
const req: __WebpackModuleApi.RequireContext = require.context('@/assets/icons', false, /\.svg$/)
requireAll(req)