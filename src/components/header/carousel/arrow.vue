<template>
  <transition name="left">
    <div class="arrow arrow-left" v-show="show" @click="switchImg(-1)">
      <svg-icon
        popper-class="icon-arrow"
        icon-class="leftArrow"
      ></svg-icon></div
  ></transition>
  <transition name="right">
    <div class="arrow arrow-right" v-show="show" @click="switchImg(1)">
      <svg-icon
        popper-class="icon-arrow"
        icon-class="rightArrow"
      ></svg-icon></div
  ></transition>
</template>

<script lang="ts">
import {
  defineComponent,
  withDefaults,
  defineProps,
  defineEmits,
  defineExpose,
  ref,
  watchEffect,
  onBeforeUnmount,
} from "@vue/runtime-core";

export default defineComponent({
  name: "arrow",
});
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    arrowtop: string; // 轮播图左右切换箭头的上边距
    show?: boolean; // 是否显示切换箭头
    id?: number; // 当前所显示轮播图片的id值
  }>(),
  {
    show: false,
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
// 暴露该清除计时函数
defineExpose({
  clearTiming,
});

/**
 * 当前所显示轮播图片的id值的一个深拷贝 (方便对id的操作)
 */
let currentId = ref<number>(0);
/**
 * 对切换轮播图片的按钮的一个点击事件进行防抖
 */
let debounce = ref<boolean>(false);
watchEffect(() => {
  // 当轮播图片id值改变时currentId也相应改变
  currentId.value = props.id;
});
/**
 * 轮播图片的切换
 * @function
 * @param {number} count - 是切换上一张轮播图还是下一张轮播图
 */
const switchImg: (count: number) => void = (count: number): void => {
  if (debounce.value) return; // 控住用户不能连续点击触发
  clearTiming(); // 如果点击小圆圈切换轮播图片时4500s后准备恢复轮播功能时清除这个功能
  debounce.value = true;
  emit("clearCarousel"); // 静止轮播
  currentId.value += count; // 轮播图片的id值+1或者-1
  if (currentId.value === 4) currentId.value = 0;
  // 当轮播图已经切换到最后一张图片后再次切换的时候让其滚动到第一张图片
  else if (currentId.value === -1) currentId.value = 3; // 当轮播图已经是第一张图片后再次切换的时候让其滚动到最后一张图片
  emit("update:id", currentId.value); // 通知父组件的改变其id值
  setTimeout(() => (debounce.value = false), 600); // 回复用户的切换图片功能
  timing.value = setTimeout(() => {
    emit("startCarousel"); // 回复轮播功能
  }, 4500);
};

onBeforeUnmount(() => {
  // 组件卸载前清除这个计时功能
  clearTiming();
});
</script>

<style lang="less" scoped>
@direction: left, right;
each(@direction, {
    .@{value}-enter-active, .@{value}-leave-active {
        transition: transform 3s ease-in-out;
    }
})
  .come() {
  enter: from;
  leave: to;
}
each(.come(), .(@v, @k) {
    .left-@{k}-@{v} {
        transform: translateX(-65px);
    }
    .right-@{k}-@{v} {
        transform: translateX(65px);
    }
})
  .arrow {
  position: absolute;
  .setWidHei(40px, 40px);
  border-radius: 45px;
  background-color: extract(@colors, 5);
  top: v-bind(arrowtop);
  color: rgb(247, 245, 245);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  cursor: pointer;
  opacity: 0.6;

  &:hover {
    background-color: rgb(214, 214, 218);
    color: extract(@colors, 4);
    opacity: 0.8;
  }

  .icon-arrow {
    .setWidHei(1.5em, 1.5em);
  }

  &-left {
    left: @arrowleft;
  }

  &-right {
    right: @arrowleft;
  }
}
</style>