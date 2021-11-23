<template>
  <scroll-bar maxHei="325px" width="98%" :content-hei="contentHei">
    <div class="cart-items">
      <ul ref="cartUl">
        <li
          :class="{
            clearfix: true,
            'bottom-sty': index !== cartList.length - 1,
          }"
          v-for="(item, index) in cartList"
          :key="item.id"
          @mouseenter="handleToId(item.id)"
          @mouseleave="handleToId(0)"
        >
          <div class="cart-items--img">
            <img
              class="lazy"
              :data-src="item.imgSrc"
              :src="require(`@/assets/empty/placeholder.80.png`)"
              alt="无法显示此图片"
            />
          </div>
          <a
            href="javascript:void(0)"
            @click="jumpRouter(item.title, item.productId)"
            class="cart-items--name aColor"
            >{{ item.name }}</a
          >
          <div class="cart-items--price">
            {{ item.price }}元
            <span style="margin-left: 1px"
              >x {{ item.count > 99 ? "99+" : item.count }}</span
            >
          </div>
          <transition name="close-fade">
            <svg-icon
              v-show="id === item.id"
              popper-class="delete-item dialog-close"
              icon-class="close"
              @click="deleteCart"
            ></svg-icon>
          </transition>
        </li>
      </ul></div
  ></scroll-bar>
  <div class="cart-items--footer">
    <div class="total">
      <div class="total-len">共 {{ cartLen }} 件商品</div>
      <div class="total-cost">{{ cost }}<span>元</span></div>
    </div>
    <a class="go-cart" href="javascript:void(0)" @click="turnToCart"
      >去购物车结算</a
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import scrollBar from "../ui-components/scrollBar.vue";
import { useMessage } from "naive-ui";
import { Base64 } from "js-base64";

export default defineComponent({
  name: "cart-items",
  components: {
    scrollBar,
  },
  computed: {
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
    // 购物车中不同商品的数量
    cartDiffLen(): number {
      return this.cartList.length;
    },
    // 购物车的总价钱
    cost(): number {
      let cost: number = 0;
      this.cartList.forEach((item) => (cost += item.cost));
      return cost;
    },
  },
  props: {
    // 购物车数据
    cartList: {
      // eslint-disable-next-line no-undef
      type: Array as PropType<Array<CartItem>>,
      required: true,
    },
    // 是否已经显示出购物车数据
    showList: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:showCart"],
  data() {
    return {
      id: 0, // 鼠标当前悬停在该件商品上的id值
      contentHei: 0, // 所有li元素的总高度和
      currentCartDiffLen: 0, // 复制一份购物车中不同商品的数量
      throttle: false,
    };
  },
  setup() {
    const message = useMessage();

    return {
      message,
    };
  },
  methods: {
    /**
     * 路由跳转(跳转至详情页)
     * @param title - 该商品所属类型
     * @param id - 该商品对应的id值
     */
    jumpRouter(title: string, id: number): void {
      this.$router.push({
        name: "detailsPage",
        params: { title },
        query: { id },
      });
    },
    // 鼠标当前悬停在哪件商品上该id值就是哪件商品的id值
    handleToId(id: number): void {
      this.id = id;
    },
    // 删除购物车中的某件商品
    deleteCart(): void {
      if (this.throttle) return;
      this.throttle = true;
      this.$store
        .dispatch("CartModule/deleteCart", {
          ids: [this.id],
          account: Base64.encode(this.$store.state.UserModule.account),
        })
        .then((value) => {
          if (value) {
            this.message.success("删除成功");
            // 删除某件商品及时更新ul元素内容的高度
            this.$nextTick(
              () =>
                (this.contentHei = (
                  this.$refs.cartUl as HTMLUListElement
                ).offsetHeight)
            );
          } else this.message.error("删除失败");
          this.throttle = false;
        })
        .catch(() => {
          this.message.error("删除失败");
          this.throttle = false;
        });
    },
    // 跳转到购物车页面
    turnToCart(): void {
      this.$emit("update:showCart", false); // 关闭购物车内容折叠框
      /* const { path } = this.$router.resolve({
        name: "cart",
        path: "/cart",
      });
      const win1: Window = window.open(path, "_blank") as Window;
      win1.postMessage('hello world', 'http://localhost:8080/cart'); */
      this.$router.push({ name: "cart" });
    },
  },
  watch: {
    showList(newValue: number): void {
      if (newValue) {
        // 如果本地的购物车中不同商品的数量和购物车中的不同商品的数量相同代表商品数量没有增加，此时没必要执行下面的动作
        if (this.currentCartDiffLen === this.cartDiffLen) return;
        setTimeout(() => {
          // 初始化ul元素内容的高度
          this.contentHei = (
            this.$refs.cartUl as HTMLUListElement
          ).offsetHeight;
          this.currentCartDiffLen = this.cartDiffLen; // 更新长度
        }, 350);
      }
    },
  },
  mounted() {
    // 初始化购物车列表的高度
    this.contentHei = (this.$refs.cartUl as HTMLUListElement).offsetHeight;
    // 将新加入购物车的商品图片作懒加载处理
    const ele: Array<HTMLImageElement> = Array.from(
      (this.$refs.cartUl as HTMLUListElement).querySelectorAll(".lazy")
    );
    (this as any).$observer(ele);
  },
});
</script>

<style lang="less" scoped>
.close-fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.5s, transform 0.4s;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: scale(0);
  }
}
.cart-items {
  &--img {
    float: left;
    .setWidHei(60px, 50px);

    img {
      .setWidHei(100%, 100%);
      object-fit: cover;
    }
  }

  .thame(@left, @size) {
    margin-left: @left;
    font-size: @size;
  }

  &--name {
    width: 100px;
    .thame(8px, 12.5px);
  }

  &--price {
    .thame(10px, 12px);
  }

  &--footer {
    position: relative;
    color: extract(@colors, 1);
    padding: 20px 0 10px 20px;
    background-color: rgba(252, 249, 249, 0.699);

    .total {
      &-len {
        font-size: 12px;
        color: #817f7f;
      }

      &-cost {
        font-size: 20px;
        color: extract(@colors, 3);

        span {
          font-size: 14px;
        }
      }
    }

    .go-cart {
      position: absolute;
      right: 30px;
      top: 20px;
      border-radius: 3px;
      padding: 10px 20px;
      background-color: extract(@colors, 3);
      color: extract(@colors, 4);
    }
  }
}
ul {
  & > li {
    padding: 15px 0;
    display: flex;
    align-items: center;
    color: extract(@colors, 1);
    width: 92%;
    margin-left: 15px;
  }
}
.bottom-sty {
  border-bottom: 1px solid #c2c2c2;
}
.delete-item {
  margin-left: 8px;
  font-size: 16px;
}
</style>