<template>
  <ul class="carousel">
    <li class="carousel-item" v-for="item in datas" :key="item.id">
      <a href="javascript:void(0);">
        <div class="item-img">
          <img :src="item.imgSrc" alt="无法加载此图片" />
        </div>
      </a>
    </li>
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
}
</style>