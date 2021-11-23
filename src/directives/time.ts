import { Directive } from "@vue/runtime-core";
import timeFormat from "@/plugins/timeFormat"

const time: Directive = {
  beforeMount(el, binding): void {
    if (binding.value) {
      const time: timeFormat = new timeFormat(binding.value);
      el.innerHTML = time.getFormatTime();
      el.__vueTime__ = setInterval(() => {
        el.innerHTML = time.getFormatTime();
      }, 60000);
    }
  },
  beforeUnmount(el): void {
    clearInterval(el.__vueTime__);
    Reflect.deleteProperty(el, '.__vueTime__');
  },
};

export default time