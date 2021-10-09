<template>
  <div
    class="carousel"
    @mouseenter="showArrow = true"
    @mouseleave="showArrow = false"
  >
    <ul>
      <li class="carousel-item" v-for="item in datas" :key="item.id">
        <a
          @mouseenter="clearCarousel"
          @mouseleave="startCarousel"
          href="javascript:void(0);"
          :style="{
            background: `url(${item.imgSrc}) no-repeat`,
            backgroundSize: `${imgwidth} ${imgheight}`,
          }"
        >
        </a>
      </li>
    </ul>
    <carousel-arrow
      ref="arrow"
      :arrowtop="arrowtop"
      :show="showArrow"
      v-model:id="id"
      @start-carousel="startCarousel"
      @clear-carousel="clearCarousel"
    ></carousel-arrow>
    <carousel-bottom
      ref="bottomArea"
      @mouseenter="showArrow = false"
      @mouseleave="showArrow = true"
      @start-carousel="startCarousel"
      @clear-carousel="clearCarousel"
      v-model:id="id"
      :datas-len="datasLen"
      :circleleft="circleleft"
    ></carousel-bottom>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  withDefaults,
  defineProps,
  computed,
  ref,
  watchEffect,
  onMounted,
  onBeforeUnmount,
  watch,
} from "@vue/runtime-core";
import carouselBottom from "./carouselBottom.vue";
import carouselArrow from "./arrow.vue";

export default defineComponent({
  components: { carouselBottom, carouselArrow },
  name: "carousel",
  data() {
    return {
      showArrow: false, // 是否显示左右箭头
    };
  },
});
</script>

<script lang="ts" setup>
/* -1226px -2452px -3678px -4904px */
const props = withDefaults(
  defineProps<{
    // eslint-disable-next-line no-undef
    datas: Array<Carousel>; // 轮播图数据
    imgwidth?: string; // 图片的宽度 (在父组件可自定义)
    imgheight?: string; // 图片的高度 (在父组件可自定义)
  }>(),
  {
    imgwidth: "1226px",
    imgheight: "460px",
  }
);

/**
 * 轮播图片的宽度 (单纯的数值不带px单位)
 */
const temp: number = +props.imgwidth.replace("px", "");
let datasLen = computed(() => props.datas.length); // 轮播图片的数量
const arrowtop: string = (+props.imgheight.replace("px", "") - 40) / 2 + "px"; // 轮播图左右切换箭头的上边距
const circleleft: string = (temp - 82) / 2 + "px"; // 轮播图底部圆圈切换区域距离父元素的左边距

/**
 * 存储了setInterval函数，便于清除
 */
let timing = ref<number>(0);
/**
 * 轮播元素ul在水平距离的移动距离 (通个这个距离的移动进行轮播，矢量位移)
 */
let moveX = ref<number>(0);
/**
 * 轮播元素ul在水平距离的移动真实距离 (moveX变量加上单位'px')
 */
let moveXpx = ref<string>("");
watchEffect(() => {
  // 将moveX值转换为带px为单位的值
  moveXpx.value = moveX.value + "px";
});
/**
 * 给轮播图当前显示的图片赋予一个id值
 */
let id = ref<number>(0);
// 监听当前所显示轮播图片的id值，根据其id值判断轮播移动的距离
watch(
  (): number => id.value,
  (newValue: number, oldValue: number): void => {
    /**
     * 当前显示轮播图的id值和之前显示的轮播图片的id值的间隔 (通过该间隔值判断轮播图滚动的距离, 如：间隔为1的话则向左移动1*temp + 'px')
     */
    const interval: number = newValue - oldValue;
    if (interval > 0) moveX.value -= interval * temp;
    // 间隔值大于0则向左移动
    else if (interval < 0) moveX.value += Math.abs(interval) * temp; // 间隔值大于0则向右移动
  }
);

/**
 * 赋予轮播底部图片切换组件ref属性的一个值
 */
let bottomArea = ref<InstanceType<typeof carouselBottom>>();
/**
 * 赋予箭头切换图片组件ref属性的一个值
 */
let arrow = ref<InstanceType<typeof carouselArrow>>();
/**
 * 轮播开始
 */
const startCarousel: () => void = (): void => {
  // 如果点击小圆圈切换轮播图片时4500s后准备恢复轮播功能时清除这个功能 (在carouselBottom组件)
  (bottomArea.value as any)?.clearTiming();
  // 如果点击箭头切换轮播图片时4500s后准备恢复轮播功能时清除这个功能 (在carouselArrow组件)
  (arrow.value as any)?.clearTiming();
  timing.value = setInterval(() => {
    id.value++;
    // 当轮播图滚到最后一张图片后再次滚动的时候其滚动到第一张图片
    if (id.value === 4) id.value = 0;
  }, 4500);
};
const clearCarousel: () => void = (): void => {
  // 如果点击小圆圈切换轮播图片时4500s后准备恢复轮播功能时清除这个功能 (在carouselBottom组件)
  (bottomArea as any).value?.clearTiming();
  // 如果点击箭头切换轮播图片时4500s后准备恢复轮播功能时清除这个功能 (在carouselArrow组件)
  (arrow.value as any)?.clearTiming();
  if (timing.value) clearInterval(timing.value);
};

/**
 * 根据用户进入还是离开页面的状态来判断是否停止轮播
 */
const isCarousel: () => void = (): void => {
  const status: string = document.visibilityState; // 获取用户的状态 (离开页面还是进入页面)
  switch (status) {
    case "visible":
      // 当用户进入页面时开始轮播
      startCarousel();
      break;
    case "hidden":
      clearCarousel();
      break;
    default:
      clearCarousel();
  }
};
// 添加该事件用来判断用户是否进入离开页面
document.addEventListener("visibilitychange", isCarousel);

onMounted((): void => {
  // 组件挂载时开始轮播
  startCarousel();
});
onBeforeUnmount((): void => {
  clearCarousel(); // 组件卸载前停止轮播
  document.removeEventListener("visibilitychange", isCarousel); // // 组件卸载前清除该事件监听
});
</script>

<style lang="less" scoped>
.carousel {
  position: relative;
  overflow: hidden;

  & > ul:first-child {
    display: flex;
    flex-wrap: nowrap;
    transition: transform 0.4s linear;
    transform: translate3d(v-bind(moveXpx), 0, 0);
  }

  &-item {
    height: v-bind(imgheight);

    & > a {
      .setWidHei(v-bind(imgwidth), v-bind(imgheight));
    }
  }
}
</style>