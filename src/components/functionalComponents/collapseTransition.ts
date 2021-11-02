import { h, Transition } from 'vue'
import Trans from './collapse'

/**
 * 折叠展开组件 collapse-transition (函数式组件)
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const collpaseTransition = (props: any, { slots }: { slots: any }) => {
    return h(Transition, new Trans(), slots)
}

export default collpaseTransition