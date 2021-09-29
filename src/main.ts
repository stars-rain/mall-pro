import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {
  // create naive ui
  create,
  // component
  NButton,
  NDivider
} from 'naive-ui'

const native = create({
  components: [
    NButton,
    NDivider
  ],
})

createApp(App).use(store).use(router).use(native).mount('#app')
