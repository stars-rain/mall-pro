<template>
  <div class="mall-header">
    <!-- 商城头部组件 -->
    <mall-header></mall-header>
    <div class="container">
      <mall-header-carousel></mall-header-carousel>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
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

<style lang="less" scoped>
.mall {
  &-header {
    height: 40px;
    background-color: extract(@colors, 1);
  }
}
</style>