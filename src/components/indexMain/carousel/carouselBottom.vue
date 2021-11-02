<template>
  <ul class="carousel-bottom">
    <li
      v-for="(count, index) in datasLen"
      :key="count"
      :class="{
        circle: true,
        'circle-nolast': count !== datasLen,
        'circle-active':
          index === id ||
          (index === 0 && id === 4) ||
          (index === datasLen - 1 && id === -1),
      }"
      @click="handleToId(index)"
    ></li>
  </ul>
</template>

<script lang="ts">
import {
  defineComponent,
  withDefaults,
  defineProps,
  defineEmits,
  ref,
  onBeforeUnmount,
  defineExpose,
} from "@vue/runtime-core";

export default defineComponent({
  name: "carouselBottom",
});
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    datasLen: number; // 轮播图片的数量
    /**
     * 当前所显示图片的id值
     */
    id?: number;
    /**
     * 是否需要重新滚动到第一张图片(当前所显示轮播图片已经是最后一张且继续向下切换时重新回到第一张图片)
     */
    theone?: boolean;
    /**
     * 是否需要重新滚动到最后一张图片(当前所显示轮播图片已经是第一张且继续向上切换时重新回到最后一张图片)
     */
    thelast?: boolean;
  }>(),
  {
    id: 0,
    theone: false,
    thelast: false,
  }
);
const emit =
  defineEmits<{
    (e: "update:id", id: number): void;
    (e: "startCarousel"): void;
    (e: "clearCarousel"): void;
    (e: "update:theone", show: boolean): void;
    (e: "update:thelast", show: boolean): void;
  }>();

/**
 * 存储了setTimeout函数，便于清除
 */
let timing = ref<number>(0);
/**
 * @function
 * 如果点击小圆圈切换轮播图片时4500s后准备恢复轮播功能时清除这个功能
 */
const clearTiming: () => void = (): void => {
  if (timing.value) clearTimeout(timing.value);
};
// 暴露该属性以便父组件访问 (当父组件轮播开始的时候且timing值有的话一定要先清除)
defineExpose({
  clearTiming,
});

/**
 * 点击小圆圈切换轮播图片
 * @function
 * @param {number} id - 当前小圆圈的index值
 */
const handleToId: (id: number) => void = (function (): (id: number) => void {
  // 防抖
  let debounce = false;
  return (id: number): void => {
    if (debounce) return;
    debounce = true;
    if (props.theone) emit("update:theone", false); // 隐藏第一张轮播图片(并非是轮播元素的第一张轮播图片)
    if (props.thelast) emit("update:theone", false); // 隐藏最后一张轮播图片(并非是轮播元素的最后一张轮播图片)
    emit("clearCarousel"); // 当前用户点击圆圈切换图片时清除轮播
    clearTiming(); // 清除恢复轮播功能
    if (id !== props.id) emit("update:id", id); // 改变当前显示图片的id值
    setTimeout(() => (debounce = false), 600);
    timing.value = setTimeout(() => emit("startCarousel"), 4500); // 恢复轮播功能
  };
})();
onBeforeUnmount(() => {
  clearTiming(); // 清除恢复轮播功能
});
</script>

<style lang="less" scoped>
.carousel {
  &-bottom {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translate3d(-50%, 0, 0);

    .bkcolors() {
      background: hsla(0, 0%, 100%, 0.4);
      border-color: rgba(0, 0, 0, 0.4);
    }
    .circle {
      .setWidHei(6px, 6px);
      border-radius: 20px;
      border: 2px solid hsla(0, 0%, 100%, 0.3);
      background-color: rgba(0, 0, 0, 0.4);
      cursor: pointer;

      &:hover {
        .bkcolors();
      }

      &-nolast {
        margin-right: 14px;
      }

      &-active {
        .bkcolors();
      }
    }
  }
}
</style>