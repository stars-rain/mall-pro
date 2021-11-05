<template>
  <div class="mall-header">
    <div class="container clearfix">
      <router-link to="/" class="header-nav header-nav__index"
        >小米商城</router-link
      >
      <div
        class="header-cart"
        @mouseover="showCart = true"
        @mouseout="showCart = false"
      >
        <router-link class="cart-nav" to="/">
          <svg-icon popper-class="icon-cart" icon-class="cart"></svg-icon>
          <span class="cart-hint">购物车 (0) </span>
        </router-link>
        <collapse-transition>
          <div class="cart-datas" v-show="showCart">
            <p class="cart-empty">购物车中还没有商品，赶紧选购吧！</p>
          </div></collapse-transition
        >
      </div>
      <div class="header-logreg" v-if="!isLogin">
        <router-link
          class="header-nav"
          :to="{ name: 'reglog', params: { title: 'login' } }"
          >登录</router-link
        >
        <span class="sep">|</span>
        <router-link
          class="header-nav"
          :to="{ name: 'reglog', params: { title: 'register' } }"
          >注册</router-link
        >
      </div>
      <user-avatar v-else :user-opera-menu="userOperaMenu"></user-avatar>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import userAvatar from "./avatar/index.vue";
import { userOperaMenu } from "@/staticDatas/userOperMenu";

export default defineComponent({
  name: "header-index",
  components: {
    userAvatar,
  },
  props: {
    // 头部根元素的高度
    height: {
      type: String,
      default: "40px",
    },
  },
  data() {
    return {
      showCart: false, // 是否显示购物车
      userOperaMenu, // 点击头像显示的对应菜单
    };
  },
});
</script>

<script lang="ts" setup>
import { useState } from "@/vuexHooks";

const { isLogin } = useState(["isLogin"], "UserModule");
</script>

<style lang="less" scoped>
.mall {
  &-header {
    margin-bottom: 100px;
    height: v-bind(height);
    background-color: extract(@colors, 1);
  }
}
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
      }
    }

    .icon-cart {
      .setWidHei(2em, 2em);
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
        background-color: extract(@colors, 4);
        box-shadow: 0 2px 10px rgb(0 0 0 / 15%);
        overflow: hidden;
        z-index: 110;
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