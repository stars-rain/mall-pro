<template>
  <ul class="carousel-bottom">
    <li
      v-for="count in datasLen"
      :key="count"
      :class="{
        circle: true,
        'circle-nolast': count !== datasLen,
      }"
    ></li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "carouselBottom",
  props: {
    /**
     * 轮播图片的数量
     */
    datasLen: {
      type: Number,
      required: true,
    },
    /**
     * 轮播图底部圆圈切换区域距离父元素的左边距
     */
    circleleft: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="less" scoped>
.carousel {
  &-bottom {
    position: absolute;
    width: 82px;
    left: v-bind(circleleft);
    bottom: 15px;

    .circle {
      width: 6px;
      height: 6px;
      border-radius: 20px;
      border: 2px solid hsla(0, 0%, 100%, 0.3);
      background-color: rgba(0, 0, 0, 0.4);
      cursor: pointer;

      &:hover {
        background: hsla(0, 0%, 100%, 0.4);
        border-color: rgba(0, 0, 0, 0.4);
      }

      &-nolast {
        margin-right: 14px;
      }
    }
  }
}
</style>