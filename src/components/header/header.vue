<template>
  <div class="mall-header">
    <div class="container clearfix">
      <router-link to="/" class="header-nav header-nav__index"
        >小米商城</router-link
      >
      <div
        class="header-cart"
        @mouseenter="getCartDatas"
        @mouseleave="showCart = false"
      >
        <a class="cart-nav" href="javascript:void(0)">
          <svg-icon
            v-if="!cartLen"
            popper-class="icon-cart"
            icon-class="cart"
          ></svg-icon>
          <svg-icon
            v-else
            popper-class="icon-cart"
            icon-class="cartfull"
          ></svg-icon>
          <span class="cart-hint"
            >购物车
            <span v-if="cartLen">({{ cartLen }})</span>
          </span>
        </a>
        <collapse-transition>
          <div class="cart-datas" v-show="showCart">
            <div
              v-if="error"
              class="cart-empty"
              style="font-size: 16px; color: rgb(252, 5, 5)"
            >
              获取失败
            </div>
            <div v-if="loading" class="cart-empty">
              <n-spin stroke="#ff6700"></n-spin>
            </div>
            <p v-if="!loading && !cartLen && !error" class="cart-empty">
              购物车中还没有商品，赶紧选购吧！
            </p>
            <n-message-provider>
              <cart-items
                v-if="cartLen && !loading"
                :cartList="cartList"
                v-model:show-list="showList"
              ></cart-items
            ></n-message-provider></div
        ></collapse-transition>
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
import cartItems from "./cartItems.vue";
import { Base64 } from "js-base64";

export default defineComponent({
  name: "header-index",
  components: {
    userAvatar,
    cartItems,
  },
  computed: {
    // 购物车数据
    // eslint-disable-next-line no-undef
    cartList(): Array<CartItem> {
      return this.$store.state.CartModule.cartList;
    },
    cartDifferenceLen(): number {
      return this.cartList.length;
    },
    // 购物车的总数量
    cartLen(): number {
      let len: number = 0;
      if (this.cartList.length)
        this.cartList.forEach(
          // eslint-disable-next-line no-undef
          (item: CartItem) => (len += item.count)
        );

      return len;
    },
    // 是否已经显示购物车数据列表
    showList(): boolean {
      return this.showCart && !this.loading;
    },
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
      loading: false, // 正在请求用户购物车数据时加载的动画
      error: false, // 加载失败显示的信息
      showCart: false, // 是否显示购物车
      userOperaMenu, // 点击头像显示的对应菜单
    };
  },
  methods: {
    getCartDatas(): void {
      this.showCart = true; // 显示购物车
      if (this.$store.state.CartModule.status === 0) return; // 如果用户购物车状态未发生改变则不请求购物车数据
      if (this.$store.state.UserModule.isLogin) {
        // 向后台请求购物车数据
        if (this.error) this.error = false;
        if (!this.loading) this.loading = true; // 开始加载动画
        this.$store
          .dispatch("CartModule/getCartDatas", {
            account: Base64.encode(this.$store.state.UserModule.account),
          })
          .then((value: boolean): void => {
            if (value) {
              this.$store.commit("CartModule/handleToStatus"); // 初始化用户购物车状态未发生改变
              setTimeout(() => {
                this.loading = false;
              }, 300); // 关闭动画
            }
          })
          .catch((value: boolean): void => {
            if (!value) {
              this.loading = false; // 关闭动画
              this.error = true; // 显示加载失败信息
            }
          });
      }
    },
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