<template>
  <div class="mall-header">
    <!-- 商城头部组件 -->
    <div class="header-container clearfix">
      <mall-header></mall-header>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import mallHeader from "@/components/header/header.vue";

export default defineComponent({
  name: "index",
  components: {
    mallHeader,
  },
});
</script>

<style lang="less" scoped>
.mall {
  &-header {
    height: 40px;
    background-color: extract(@colors, 1);

    .header {
      &-container {
        width: @width;
        margin: 0 auto;
      }
    }
  }
}
</style>