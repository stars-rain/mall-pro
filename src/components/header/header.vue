<template>
  <a
    href="javascript:void(0)"
    class="header-nav header-nav__index"
    @click="refresh"
    >小米商城</a
  >
  <div class="header-cart">
    <router-link class="cart-nav" to="/">
      <svg-icon popper-class="icon-cart" icon-class="cart"></svg-icon>
      <span class="cart-hint">购物车 (0) </span>
    </router-link>
    <div class="cart-datas">
      <p class="cart-empty">购物车中还没有商品，赶紧选购吧！</p>
    </div>
  </div>
  <div class="header-logreg">
    <router-link class="header-nav" to="/">登录</router-link>
    <span class="sep">|</span>
    <router-link class="header-nav" to="/">注册</router-link>
  </div>
  <header-footer></header-footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import headerFooter from "./footer.vue";

export default defineComponent({
  name: "header-index",
  components: {
    headerFooter,
  },
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
  color: #b0b0b0;
  padding: 0 5px;
  line-height: 40px;

  &:hover {
    transition: all 0.3s;
    color: extract(@colors, 4);
  }
}

.header {
  &-nav__index {
    font-size: 15px;
  }

  .cartlogreg() {
    float: right;
    font-size: 13px;
  }

  &-logreg {
    margin-right: 20px;

    .cartlogreg();

    .sep {
      color: extract(@colors, 2);
      margin: 0 0.3em;
    }
  }

  &-cart {
    .cartlogreg();
    background-color: extract(@colors, 2);
    position: relative;

    &:hover {
      .cart {
        &-nav {
          color: extract(@colors, 3);
        }

        &-datas {
          height: 100px;
        }
      }
    }

    .icon-cart {
      width: 2em;
      height: 2em;
      vertical-align: middle;
    }

    .cart {
      &-nav {
        padding: 0 10px;
        line-height: 40px;
        color: extract(@colors, 4);
        transition: color 0.3s;
      }

      &-hint {
        margin-left: 3px;
      }

      &-datas {
        position: absolute;
        top: 40px;
        right: 0;
        width: 316px;
        height: 0;
        background-color: #fff;
        box-shadow: 0 2px 10px rgb(0 0 0 / 15%);
        overflow: hidden;
        transition: height 0.3s;
      }

      &-empty {
        height: 20px;
        margin: 40px 0;
        text-align: center;
      }
    }
  }
}
</style>