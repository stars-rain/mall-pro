<template>
  <div class="mall-header">
    <div class="mall-header__container clearfix">
      <a
        href="javascript:void(0)"
        class="header-nav header__index"
        @click="refresh"
        >小米商城</a
      >
      <div class="header-cart">
        <router-link class="header-nav" to="/">
          <svg-icon icon-class="cart"></svg-icon>
          <span>购物车 (0) </span>
        </router-link>
      </div>
      <div class="header-logreg">
        <router-link class="header-nav header-right__login" to="/"
          >登录</router-link
        >
        <span class="sep">|</span>
        <router-link class="header-nav header-right__register" to="/"
          >注册</router-link
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// import axios from "axios";

export default defineComponent({
  name: "index",
});
</script>

<script lang="ts" setup>
import { useRouter } from "vue-router";

const router = useRouter();
/**
 * 刷新页面
 */
const refresh: () => void = (): void => router.go(0);
</script>

<style lang="less" scoped>
.header-nav {
  display: inline-block;
  color: #b0b0b0;
  padding: 0 5px;
  line-height: 40px;
  text-decoration: none;

  &:hover {
    transition: all 0.2s;
    color: #fff;
  }
}

.mall {
  &-header {
    height: 40px;
    background-color: #333;

    &__container {
      width: 1226px;
      margin: 0 auto;

      .header {
        &__index {
          font-size: 15px;
        }

        .catlogreg() {
          float: right;
          font-size: 13px;
        }

        &-logreg {
          .catlogreg();

          .sep {
            color: #424242;
            margin: 0 0.3em;
          }
        }

        &-cart {
          .catlogreg();
          background-color: #424242;
          padding: 0 10px;
          margin: 0 20px;
        }
      }
    }
  }
}
</style>