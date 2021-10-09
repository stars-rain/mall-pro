<template>
  <ul class="carousel-bottom">
    <li
      v-for="(count, index) in datasLen"
      :key="count"
      :class="{
        circle: true,
        'circle-nolast': count !== datasLen,
        'circle-active': index === id,
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
    circleleft: string; // 轮播图底部圆圈切换区域距离父元素的左边距
    /**
     * 当前所显示图片的id值
     */
    id?: number;
  }>(),
  {
    id: 0,
  }
);
const emit =
  defineEmits<{
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
const handleToId: (id: number) => void = (id: number): void => {
  // 如果用户点击显示当前图片的小圆圈时直接return
  if (id === props.id) return;
  clearTiming(); // 清除恢复轮播功能
  emit("clearCarousel"); // 当前用户点击圆圈切换图片时清除轮播
  emit("update:id", id); // 改变当前显示图片的id值
  timing.value = setTimeout(() => emit("startCarousel"), 4500); // 恢复轮播功能
};
onBeforeUnmount(() => {
  clearTiming(); // 清除恢复轮播功能 
});
</script>

<style lang="less" scoped>
.carousel {
  &-bottom {
    position: absolute;
    width: 82px;
    left: v-bind(circleleft);
    bottom: 15px;

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