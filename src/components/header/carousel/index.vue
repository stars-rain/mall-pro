<template>
  <ul class="carousel">
    <li class="carousel-item" v-for="item in datas" :key="item.id">
      <a
        href="javascript:void(0);"
        :style="{
          background: `url(${item.imgSrc}) no-repeat`,
          backgroundSize: `${imgwidth} ${imgheight}`,
        }"
      >
      </a>
    </li>
    <carousel-bottom
      :datas-len="datasLen"
      :circleleft="circleleft"
    ></carousel-bottom>
  </ul>
</template>

<script lang="ts">
import { defineComponent, withDefaults, defineProps, computed } from "vue";
import carouselBottom from "./carouselBottom.vue";

export default defineComponent({
  components: { carouselBottom },
  name: "carousel",
});
</script>

<script lang="ts" setup>
/* -1226px -2452px -3678px -3678px */
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

let datasLen = computed(() => props.datas.length); // 轮播图片的数量
const circleleft: string = (+props.imgwidth.replace("px", "") - 82) / 2 + "px"; // 轮播图底部圆圈切换区域距离父元素的左边距
</script>

<style lang="less" scoped>
.carousel {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: hidden;

  &-item {
    height: v-bind(imgheight);

    & > a {
      width: v-bind(imgwidth);
      height: v-bind(imgheight);
    }
  }
}
</style>