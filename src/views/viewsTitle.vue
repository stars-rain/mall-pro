<template>
  <div class="views-header container clearfix">
    <svg-icon popper-class="VH-icon" :icon-class="iconClass"></svg-icon>
    <span class="views-header__title"
      >{{ title }}
      <span class="views-header__len" v-if="len"
        >({{ len > 99 ? "99+" : len }})</span
      >
    </span>
    <router-link title="返回首页" to="/"></router-link>
  </div>
  <div class="views-shadow" v-bind="$attrs"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "views-title",
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
    // 数据长度
    len: {
      type: Number,
      required: true,
    },
  },
});
</script>

<style lang="less" scoped>
.VH-icon {
  font-size: 30px;
  margin-right: 8px;
}
.setSize(@size) {
  .setWidHei(@size, @size);
  line-height: @size;
}

.one-len {
  .setSize(25px);
}

.two-len {
  .setSize(28px);
}

.three-len {
  .setSize(35px);
}
.views {
  &-header {
    padding: 0 29px;
    height: 76px;
    line-height: 76px;
    color: extract(@colors, 3);
    box-sizing: border-box;

    &__title {
      font-size: 22px;
    }

    &__len {
      font-size: 20px;
    }

    & > a {
      .setWidHei(56px, 56px);
      background: url("~@/assets/logo.png") no-repeat;
      background-size: 56px 56px;
      float: right;
      margin-top: 10px;
    }
  }

  &-shadow {
    height: 5px;
    background-image: linear-gradient(extract(@colors, 3) 5%, transparent);
  }
}
</style>