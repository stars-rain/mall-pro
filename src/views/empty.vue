<template>
  <div class="datas-empty flex">
    <svg-icon
      popper-class="datas-empty__icon"
      :icon-class="iconClass"
    ></svg-icon>
    <p class="datas-empty__desc">
      {{ title }}
      <router-link class="to-shopping" to="/">选购</router-link>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "datas-empty",
  props: {
    // 图标的icon-class类名
    iconClass: {
      type: String,
      required: true,
    },
    // 标题名, 如：我的收藏、我的订单等
    title: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="less" scoped>
.datas-empty {
  flex-direction: column;

  &__icon {
    .setWidHei(500px, 500px);
  }

  &__desc {
    font-size: 17px;
    margin-top: -80px;
    color: #9e9e9f;

    a {
      color: extract(@colors, 3);
    }
  }
}
</style>