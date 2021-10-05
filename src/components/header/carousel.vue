<template>
  <ul class="carousel">
    <li class="carousel-item" v-for="item in datas" :key="item.id">
      <a href="javascript:void(0);">
        <div class="item-img">
          <img :src="item.imgSrc" alt="无法加载此图片" />
        </div>
      </a>
    </li>
    <ul class="carousel-bottom">
      <li
        v-for="count in 4"
        :key="count"
        :class="{
          circle: true,
          'circle-two': count === 2,
          'circle-three': count === 3,
        }"
      ></li>
    </ul>
  </ul>
</template>

<script lang="ts">
import { defineComponent, defineProps, PropType } from "vue";

export default defineComponent({});
</script>

<script lang="ts" setup>
/* -1226px -2452px -3678px -3678px */
defineProps({
  datas: {
    // eslint-disable-next-line no-undef
    type: Array as PropType<Array<Carousel>>,
    required: true,
  },
});
</script>

<style lang="less" scoped>
.carousel {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: hidden;

  &-item {
    height: 460px;

    .item {
      &-img {
        width: 1226px;
        height: 460px;

        img {
          .widHei();
        }
      }
    }
  }

  &-bottom {
    position: absolute;
    left: 572px;
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

      &-two {
        margin: 0 14px;
      }

      &-three {
        margin-right: 14px;
      }
    }
  }
}
</style>