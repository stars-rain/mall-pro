// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ComponentCustomProperties } from 'vue'
import type { Store } from 'vuex'
import type { AllState } from "./interface"

declare module '@vue/runtime-core' {
    // 为 `this.$store` 提供类型声明
    interface ComponentCustomProperties {
        $store: Store<AllState>
    }
}