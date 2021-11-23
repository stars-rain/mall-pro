<template>
  <ul class="carousel-bottom">
    <li
      v-for="(count, index) in datasLen"
      :key="count"
      :class="{
        'bottom-type': true,
        'bottom-circle': type === 'circle',
        'bottom-rect': type === 'rect',
        'bottom-nolast': count !== datasLen,
        'bottom-circle--active': index + 1 === id && type === 'circle',
        'bottom-rect--active': index + 1 === id && type === 'rect',
      }"
      @click="handleToId(index + 1)"
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
     * 恢复轮播的时间
     */
    time?: number;
    type?: string; // 按钮类型
  }>(),
  {
    id: 0,
    theone: false,
    thelast: false,
    time: 4500,
    type: "circle",
  }
);
const emit = defineEmits<{
  (e: "update:id", id: number): void;
  (e: "startCarousel"): void;
  (e: "clearCarousel"): void;
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
    emit("clearCarousel"); // 当前用户点击圆圈切换图片时清除轮播
    clearTiming(); // 清除恢复轮播功能
    if (id !== props.id) emit("update:id", id); // 改变当前显示图片的id值
    setTimeout(() => (debounce = false), 600);
    timing.value = setTimeout(() => emit("startCarousel"), props.time); // 恢复轮播功能
  };
})();
onBeforeUnmount(() => {
  clearTiming(); // 清除恢复轮播功能
});
</script>

<style lang="less" scoped>
.bkcolors() {
  background: hsla(0, 0%, 100%, 0.4);
  border-color: rgba(0, 0, 0, 0.4);
}
.carousel {
  &-bottom {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translate3d(-50%, 0, 0);
    width: 100%;
    text-align: center;
    box-sizing: border-box;
  }
}
.bottom {
  &-type {
    cursor: pointer;
    transition: background-color 0.4s;
  }

  &-nolast {
    margin-right: 14px;
  }

  &-circle {
    .setWidHei(6px, 6px);
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 20px;
    border: 2px solid hsla(0, 0%, 100%, 0.3);
    &:hover {
      .bkcolors();
    }

    &--active {
      .bkcolors();
    }
  }

  &-rect {
    .setWidHei(40px, 4px);
    background-color: #ccc;

    &:hover {
      background-color: rgba(0, 0, 0, 0.514);
    }

    &--active {
      background-color: rgba(0, 0, 0, 0.514);
    }
  }
}
</style>