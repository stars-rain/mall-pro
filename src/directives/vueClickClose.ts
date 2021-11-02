import { Directive } from "@vue/runtime-core";

const vueOutClickClose: Directive = {
  mounted(el, binding): void {
    /**
     * 判断被点击的目标元素是否包含在el(包含该指令的元素)元素里面
     * @param ev 鼠标事件 
     */
    function isOut(ev: MouseEvent): void {
      function isTrue(): boolean {
        // 当被点击的目标元素无无父元素时直接返回false
        if (!(ev.target as any)?.parentNode) return false
        // 判断用户点击元素是不是用户的头像而且该操作菜单是对应的操作菜单
        return Array.from(el.classList).includes('popover-avatarUpload')
          && Array.from((ev.target as any).parentNode.classList).includes('n-avatar')
      }
      // 如果被点击的元素是该操作菜单时或者是修改用户资料的操作菜单且点击的是用户头像的时候则直接返回
      if (el.contains(ev.target) || isTrue()) return
      // 否则关闭对应的操作菜单(binding.value是一个函数用户关闭操作菜单)
      if (binding.value) binding.value(false);
    }
    el.__vueOutClickClose__ = isOut;
    document.addEventListener('click', el.__vueOutClickClose__);
  },
  beforeUnmount(el): void {
    document.removeEventListener('click', el.__vueOutClickClose__);
    Reflect.deleteProperty(el, '__vueOutClickClose__');
  },
};

export default vueOutClickClose