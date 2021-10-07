// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'
import { State } from "./index"

declare module '@vue/runtime-core' {
    // 为 `this.$store` 提供类型声明
    interface ComponentCustomProperties {
        $store: Store<State>
    }
}