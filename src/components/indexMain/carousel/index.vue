<template>
  <div
    class="carousel"
    @mouseenter="showArrow = true"
    @mouseleave="showArrow = false"
  >
    <ul :class="{ 'carousel-item__transform': isTransform }">
      <li class="carousel-item" v-for="item in datas" :key="item.id">
        <a
          @mouseenter="clearCarousel"
          @mouseleave="startCarousel"
          href="javascript:void(0);"
          :style="{
            background: `url(${item?.imgSrc}) no-repeat`,
            backgroundSize: `${imgwidth} ${imgheight}`,
          }"
        >
        </a>
      </li>
    </ul>
    <transition name="thelast">
      <ul class="last-one" v-show="thelast">
        <li class="carousel-item">
          <a
            href="javascript:void(0);"
            :style="{
              background: `url(${datas[datasLen - 1]?.imgSrc}) no-repeat`,
              backgroundSize: `${imgwidth} ${imgheight}`,
            }"
          >
          </a>
        </li></ul
    ></transition>
    <transition name="theone">
      <ul class="last-one" v-show="theone">
        <li class="carousel-item">
          <a
            href="javascript:void(0);"
            :style="{
              background: `url(${datas[0]?.imgSrc}) no-repeat`,
              backgroundSize: `${imgwidth} ${imgheight}`,
            }"
          >
          </a>
        </li></ul
    ></transition>
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
      v-model:theone="theone"
      v-model:thelast="thelast"
      :datas-len="datasLen"
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
/**
 * 轮播图片的数量
 */
let datasLen = computed(() => props.datas.length);
const arrowtop: string = (+props.imgheight.replace("px", "") - 40) / 2 + "px"; // 轮播图左右切换箭头的上边距
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
/**
 * 是否需要重新滚动到第一张图片(当前所显示轮播图片已经是最后一张且继续向下切换时重新回到第一张图片)
 */
let theone = ref<boolean>(false);
/**
 * 是否需要重新滚动到最后一张图片(当前所显示轮播图片已经是第一张且继续向上切换时重新回到最后一张图片)
 */
let thelast = ref<boolean>(false);
/**
 * 是否需要给轮播元素添加相应类名(主要用来控制css属性transition)
 */
let isTransform = ref<boolean>(true);

/**
 * @function
 * 当从第一张轮播图片继续向上滚动时此时应滚动到最后一张图片
 */
const isShowLast: () => void = (): void => {
  thelast.value = true; // 显示最后一张轮播图片
  moveX.value += temp; // 轮播元素向右滚动一个temp的距离
  setTimeout(() => {
    isTransform.value = false; // 移除轮播元素的相应类名 (消除transition属性)
    id.value = datasLen.value - 1; // 手动修改回当前所显示轮播图片的id值为最后一张轮播图片所代表的id值
    moveX.value = -(datasLen.value - 1) * temp; // 轮播元素重新回到滚动到最后一张图片的状态
    setTimeout(() => {
      thelast.value = false; // 隐藏最后一张轮播图片(并非是轮播元素的最后一张轮播图片)
      isTransform.value = true; // 给轮播元素添加相应类名 (增加transition属性)
    }, 50);
  }, 400);
};
/**
 * @function
 * 当从最后一张轮播图片继续向下滚动时此时应滚动到第一张图片
 */
const isShowOne: () => void = (): void => {
  theone.value = true; // 显示第一张轮播图片
  setTimeout(() => {
    isTransform.value = false; // 移除轮播元素的相应类名 (消除transition属性)
    id.value = 0; // 手动修改回当前所显示轮播图片的id值为第一张轮播图片所代表的id值
    setTimeout(() => {
      theone.value = false; // 隐藏第一张轮播图片(并非是轮播元素的第一张轮播图片)
      isTransform.value = true; // 给轮播元素添加相应类名 (增加transition属性)
    }, 50);
  }, 400);
};
// 监听当前所显示轮播图片的id值，根据其id值判断轮播移动的距离
watch(
  (): number => id.value,
  (newValue: number, oldValue: number): void => {
    /* 当从第一张轮播图片继续向上滚动时此时应滚动到最后一张
    图片, 因此不用继续执行该函数(手动设置轮播图片的id值为最后一张图片的id值，因此不需要执行监听动作) */
    if (newValue === datasLen.value - 1 && oldValue === -1) return;
    else if (newValue === -1 && oldValue === 0) {
      // 当从第一张轮播图片继续向上滚动时此时应滚动到最后一张图片
      isShowLast();
      return;
    } else if (newValue === datasLen.value && oldValue === datasLen.value - 1) {
      // 当从最后一张轮播图片继续向下滚动时此时应滚动到第一张图片
      isShowOne();
    }
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
 * 清除arrow组件和carouselBottom组件的恢复轮播图的功能
 */
const clearArrowBottom: () => void = (): void => {
  // 如果点击小圆圈切换轮播图片时4500s后准备恢复轮播功能时清除这个功能 (在carouselBottom组件)
  (bottomArea.value as any)?.clearTiming();
  // 如果点击箭头切换轮播图片时4500s后准备恢复轮播功能时清除这个功能 (在carouselArrow组件)
  (arrow.value as any)?.clearTiming();
};
/**
 * 轮播开始
 */
const startCarousel: () => void = (): void => {
  clearArrowBottom();
  timing.value = setInterval(() => {
    id.value++;
  }, 4500);
};
/**
 * 停止轮播
 */
const clearCarousel: () => void = (): void => {
  clearArrowBottom();
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
@status: theone, thelast;
each(@status, {
  .@{value}-enter-active {
    transition: transform 0.4s linear;
  }
  .@{value}-enter-from {
    transform: translate3d(if(@value=theone, 100%, -100%), 0, 0);
  }
})
  .carousel {
  position: relative;
  overflow: hidden;

  & > ul:first-child {
    display: flex;
    flex-wrap: nowrap;
    transform: translate3d(v-bind(moveXpx), 0, 0);
  }

  &-item {
    height: v-bind(imgheight);

    & > a {
      .setWidHei(v-bind(imgwidth), v-bind(imgheight));
    }

    &__transform {
      transition: transform 0.4s linear;
    }
  }

  .last-one {
    position: absolute;
    top: 0;
  }
}
</style>