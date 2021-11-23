<template>
  <div
    class="details-carousel"
    @mouseenter.prevent="handToShowArrow(true)"
    @mouseleave.prevent="handToShowArrow(false)"
  >
    <div>
      <transition-group
        class="carousel-ul"
        name="carousel-fade"
        mode="out-in"
        tag="ul"
      >
        <li
          class="details-carousel__img"
          v-for="item in datas"
          :key="item.id"
          v-show="item.id === id"
        >
          <img
            @mouseenter="clearCarousel"
            @mouseleave="startCarousel"
            :src="item.src"
            alt="无法加载此图片"
          />
        </li>
      </transition-group>
    </div>
    <carousel-arrow
      ref="arrow"
      v-if="datas.length > 1"
      :imgheight="400"
      :show="showArrow"
      v-model:id="id"
      @start-carousel="startCarousel"
      @clear-carousel="clearCarousel"
      :time="4000"
    ></carousel-arrow>
    <carousel-bottom
      v-if="datas.length > 1"
      type="rect"
      ref="bottomArea"
      @mouseenter.prevent="handToShowArrow(false)"
      @mouseleave.prevent="handToShowArrow(true)"
      @start-carousel="startCarousel"
      @clear-carousel="clearCarousel"
      v-model:id="id"
      :datas-len="datas.length"
    ></carousel-bottom>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  defineProps,
  withDefaults,
  ref,
  watchEffect,
  onMounted,
  onBeforeUnmount,
  watch,
} from "@vue/runtime-core";
import carouselArrow from "@/components/indexMain/carousel/arrow.vue";
import carouselBottom from "./carouselBottom.vue";

export default defineComponent({
  name: "details-carousel",
  data() {
    return {
      showArrow: false, // 是否显示左右箭头
    };
  },
  methods: {
    handToShowArrow(show: boolean): void {
      if (this.showArrow !== show) this.showArrow = show;
    },
  },
});
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    datas: Array<{ id: number; src: string }>; // 详情页轮播数据
    width?: string | number; // 轮播区域的宽度
    height?: number | string; // 轮播区域的高度
  }>(),
  {
    width: 400,
    height: 400,
  }
);

/**
 * 当前轮播区域的宽度
 */
let wid = ref<string | number>();
/**
 * 当前轮播区域的高度
 */
let hei = ref<string | number>();
watchEffect(() => {
  wid.value =
    typeof props.width === "number" ? props.width + "px" : props.width;
  hei.value =
    typeof props.height === "number" ? props.height + "px" : props.height;
});

/**
 * 给计时函数setInterval一个容器(方便清除计时功能)
 */
let timing = ref<number>(0);
/**
 * 当前需要显示的轮播图片
 */
let id = ref<number>(1);

// 监听id值
watch(
  (): number => id.value,
  (newId: number): void => {
    // 如果已经切换到最后一张图片则重新切回第一张图片
    if (newId === props.datas.length + 1) id.value = 1;
    // 如果已经切换到第一张图片还继续向上切换时则切换到最后一张图片
    else if (newId === 0) id.value = props.datas.length;
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
 * 开始轮播
 */
const startCarousel: () => void = (): void => {
  //if (showArrow.value) showArrow.value = false; // 隐藏箭头
  timing.value = setInterval(() => {
    id.value++;
  }, 4000);
};
/**
 * 清除轮播
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

onMounted(() => {
  // 如果只有一张图片则不需要轮播
  if (props.datas.length === 1) return;
  document.addEventListener("visibilitychange", isCarousel); // 添加该事件用来判断用户是否进入离开页面
  // 开始轮播图片
  startCarousel();
});

onBeforeUnmount(() => {
  // 如果只有一张图片则不需要清除轮播
  if (props.datas.length === 1) return;
  clearCarousel(); // 组件卸载前清除轮播数据
  document.removeEventListener("visibilitychange", isCarousel); // 组件卸载前清除该事件监听
});
</script>

<style lang="less" scoped>
.carousel-fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.8s linear;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
.details-carousel {
  .setWidHei(v-bind(wid), v-bind(hei));
  position: relative;
  overflow: hidden;
  margin: 0 auto;

  & > ul.carousel-ul {
    .setWidHei(100%, 100%);
    margin: 0 auto;
  }

  &__img {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate3d(-50%, 0, 0);
    .setWidHei(400px,400px);

    img {
      .setWidHei(100%, 100%);
      object-fit: cover;
    }
  }
}
</style>