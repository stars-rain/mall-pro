<template>
  <div class="cart-header">
    <svg-icon popper-class="icon-cart--full" icon-class="cartfull"></svg-icon>
    <span class="cart-header__title"
      >我的购物车
      <span
        v-if="cartLen"
        :class="{
          'cart-header__len': true,
          'one-len': cartLen < 10,
          'two-len': cartLen >= 10,
          'three-len': cartLen > 99,
        }"
        >{{ cartLen > 99 ? "99+" : cartLen }}</span
      >
    </span>
  </div>
  <div class="cart-header__footer">
    <router-link title="返回首页" to="/"></router-link>
    <span class="cart-header__prompt"
      >温馨提示：为了更好的体验购物请尽快清空您的购物车</span
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "cart-header",
  props: {
    // 购物车中的总商品数量
    cartLen: {
      type: Number,
      defualt: 0,
    },
  },
});
</script>

<style lang="less" scoped>
.icon-cart--full {
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
.cart-header {
  padding: 22px 40px;
  background-color: extract(@colors, 3);
  color: extract(@colors, 4);
  box-sizing: border-box;

  &__title {
    font-size: 18px;
  }

  &__len {
    display: inline-block;
    text-align: center;
    border-radius: 50%;
    font-size: 17px;
    background-color: extract(@colors, 4);
    color: extract(@colors, 3);
  }

  &__prompt {
    color: #757575;
    font-size: 14px;
    margin-left: 25px;
  }

  &__footer {
    padding: 10px 0 10px 40px;
    display: flex;
    align-items: center;

    & > a {
      .setWidHei(56px, 56px);
      background: url("~@/assets/logo.png") no-repeat;
      background-size: 56px 56px;
    }
  }
}
</style>