<template>
  <div class="mall-header">
    <!-- 商城头部组件 -->
    <mall-header></mall-header>
    <div class="container">
      <mall-header-carousel :datas="carouselData"></mall-header-carousel>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount } from "vue";
import mallHeader from "@/components/header/header.vue";
import mallHeaderCarousel from "@/components/header/carousel.vue";

export default defineComponent({
  name: "index",
  components: {
    mallHeader,
    mallHeaderCarousel,
  },
});
</script>

<script lang="ts" setup>
import axios from "axios";

/**
 * 头部轮播图数据
 */
// eslint-disable-next-line no-undef
const carouselData = ref<Array<Carousel>>([]);

onBeforeMount(async () => {
  /* 发送请求轮播图数据 */
  const { data } = await axios.get("/slideshow");
  carouselData.value = data;
});
</script>

<style lang="less" scoped>
.mall {
  &-header {
    height: 40px;
    background-color: extract(@colors, 1);
  }
}
</style>