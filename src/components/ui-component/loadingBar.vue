<template>
  <template v-if="loading">
    <teleport to="body">
      <div ref="loadingBar" class="loading-bar"></div> </teleport
  ></template>
  <template v-if="show">
    <slot></slot>
  </template>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  defineExpose,
  nextTick,
  onBeforeUnmount,
} from "@vue/runtime-core";

export default defineComponent({
  name: "loading",
});
</script>

<script lang="ts" setup>
import { useRouter } from "vue-router";

const router = useRouter();
/**
 * 给加载条的根元素添加一个ref属性便于操作
 */
const loadingBar = ref<any>(null);

/**
 * 改变加载条元素的样式
 * @function
 * @param {string} sty - css样式属性
 * @param {string} value - 对应的属性值
 */
const handleToSty: (sty: string, value: string) => void = (
  sty: string,
  value: string
): void => {
  loadingBar.value.style[sty] = value;
};

/**
 * 存储了setInterval函数，便于清除
 */
let timing = ref<number>(0);
/**
 * 清除setInterval函数
 */
const clearTiming: () => void = (): void => {
  if (timing.value) clearInterval(timing.value);
};

/**
 * 是否显示默认插槽内容
 */
let show = ref<boolean>(false);
/**
 * 加载条是否加载完成
 */
let isFinish = ref<boolean>(false);
/**
 * 是否开始显示加载条
 */
let loading = ref<boolean>(false);

/**
 * 加载条开始滚动
 */
const start: () => void = (): void => {
  loading.value = true; // 加载条开始加载
  let wid = 0; // 加载条在固定时间戳下增加的宽度值
  if (show.value) show.value = false; // 加载条加载时隐藏插槽内容
  if (isFinish.value) isFinish.value = false; // 设置加载条未加载完成

  nextTick(() => {
    timing.value = setInterval(() => {
      let bodyWid: number = document.body.clientWidth; // body的宽度(最终加载条需要加载到该宽度)
      let loadingWid: number = +loadingBar.value.style.width.replace("px", ""); // 加载条此时的宽度、

      if (loadingWid <= bodyWid * 0.3) wid += 5;
      else if (
        loadingWid > bodyWid * 0.3 &&
        loadingWid <= bodyWid * 0.5 &&
        !isFinish.value
      )
        wid += 4;
      else if (
        loadingWid > bodyWid * 0.5 &&
        loadingWid <= bodyWid * 0.6 &&
        !isFinish.value
      )
        // 当加载条长度超过body宽度一半且还没完成加载时时加载速度减慢
        wid += 3;
      else if (
        loadingWid > bodyWid * 0.6 &&
        loadingWid <= bodyWid * 0.7 &&
        !isFinish.value
      )
        // 当加载条长度超过body宽度0.6倍且还没完成加载时加载速度减慢
        wid += 2;
      else if (
        loadingWid > bodyWid * 0.7 &&
        loadingWid <= bodyWid * 0.8 &&
        !isFinish.value
      )
        wid += 1;
      else if (loadingWid > bodyWid * 0.8 && !isFinish.value) {
        // 当加载条长度超过body宽度0.8倍且还没完成加载时加载条背景色变红
        handleToSty("backgroundColor", "red");
        wid += 0.5;
      }
      handleToSty("width", `${wid}px`); // 显示此时加载条的宽度
      if (loadingWid >= bodyWid * 0.9 && !isFinish.value) {
        // 当加载条长度超过body宽度0.9倍且还没完成加载时不再改变宽度且21秒后重定向到404页面
        clearInterval(timing.value);
        setTimeout(() => {
          router.replace("/404");
          // 将加载条背景颜色变回原色
          handleToSty("backgroundColor", "#f0790a");
        }, 21000);
      }
    }, 20);
  });
};

/**
 * 加载条结束滚动
 */
const finish: (duration?: number) => void = (duration = 250): void => {
  handleToSty("transition", "width .25s linear");
  clearTiming(); // 清除setInterval函数
  let width: number = document.body.clientWidth;
  handleToSty("width", `${width}px`);
  setTimeout(() => {
    handleToSty("transition", "");
    show.value = true; // 显示插槽内容
    loading.value = false; // 关闭加载条
    isFinish.value = true; // 通知加载条加载完毕
  }, duration);
};

defineExpose({
  start,
  finish,
});

onBeforeUnmount(() => {
  clearTiming(); // 清除setInterval函数
});
</script>

<style lang="less" scoped>
.loading {
  &-bar {
    position: fixed;
    top: 0;
    height: 2px;
    background-color: #f0790a;
  }
}
</style>