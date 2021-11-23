<template>
  <div class="cart-footer__payment clearfix">
    <div class="payment-left">
      <a
        href="javascript:void(0)"
        :class="{
          'clear-cart': true,
          'clear-cart__has': cartDiffLen,
          'clear-cart__noHas': !cartDiffLen,
        }"
        @click="clearTheCart"
        >清空购物车</a
      >
      <div class="payment-left__spa"></div>
      <a
        :class="{
          'cart-footer__delete': true,
          'cart-footer__delete--checked': selectIds.length,
          'cart-footer__delete--nochecked': !selectIds.length,
        }"
        href="javascript:void(0)"
        @click="deleteCommodities(selectIds)"
        >删除</a
      >
      共计<span class="total-number">{{ cartLen }}</span
      >件商品，已选<span class="total-number">{{ selectIdsLen }}</span
      >件商品
    </div>
    <div class="payment-right">
      合计<span class="total-number" style="font-size: 30px">{{
        totalMoney
      }}</span
      >元
      <button
        :class="{
          'payment-button': true,
          'payment-button__has': cartLen && selectIds.length,
          'payment-button__noHas': !cartLen || !selectIds.length,
        }"
        @click="payingFor"
        :loading="loading"
      >
        {{ loading ? "结算中..." : "现在结算" }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  defineProps,
  ref,
  defineEmits,
} from "@vue/runtime-core";

export default defineComponent({
  name: "cart-footer",
});
</script>

<script lang="ts" setup>
import { Base64 } from "js-base64";
import { useMessage } from "naive-ui";
import { useStore } from "@/store/index";

const $message = useMessage();
const store = useStore();
const props = defineProps<{
  selectIds: Array<number>; // 当前所勾选的商品的id集合
  // eslint-disable-next-line no-undef
  cartList: Array<CartItem>; // 购物车数据列表
}>();
const emits = defineEmits<{
  (e: "handlerSelectids", ids: Array<number>): void; // 通知父组件用户所勾选的商品id集合以改变
  (e: "handlerPrompt", mess: string): void;
  (e: "handlerDialog", show: boolean): void;
}>();

/**
 * 购物车中不同商品的总数量
 */
let cartDiffLen = computed(() => props.cartList.length);
/**
 * 购物车中商品的总数量
 */
let cartLen = computed((): number => {
  let len: number = 0;
  if (props.cartList.length)
    props.cartList.forEach((item) => (len += item.count));
  return len;
});

/**
 * 勾选的商品总件数
 */
let selectIdsLen = computed((): number => {
  let len: number = 0;
  props.cartList.forEach((item) => {
    if (props.selectIds.includes(item.id)) len += item.count;
  });
  return len;
});

/**
 * 用户购物车所得商品的总价之和
 */
let totalMoney = computed((): number => {
  let total: number = 0;
  props.cartList.forEach((item) => {
    if (props.selectIds.includes(item.id)) total += item.cost;
  });
  return total;
});

// 清空购物车
const clearTheCart: () => void = (): void => {
  if (!cartDiffLen) return; // 如果购物车中无数据则直接返回
  emits("handlerPrompt", "是否清空购物车？"); // 改变对话框的提示
  emits("handlerDialog", true); // 打开对话框
};

/**
 * 删除购物车中的所勾选的商品
 * @param ids - 用户所勾选的id集合
 */
const deleteCommodities: (ids: Array<number>) => void = (
  ids: Array<number>
): void => {
  if (ids.length !== 0) {
    emits("handlerPrompt", `是否删除已选中的${selectIdsLen.value}件商品`); // 改变对话框的提示
    emits("handlerDialog", true); // 打开对话框
  }
};

/**
 * 用户正在付款显示的加载动画
 */
let loading = ref<boolean>(false);
// 用户准备付款
const payingFor: () => void = (): void => {
  if (!cartLen.value || loading.value || !props.selectIds.length) return; // 如果购物车中无数据或者用户正在付款则直接返回
  loading.value = true; // 开始加载动画
  setTimeout(() => {
    store
      .dispatch("CartModule/deleteCart", {
        account: Base64.encode(store.state.UserModule.account),
        ids: props.selectIds,
      })
      .then((value: boolean): void => {
        if (value) {
          emits('handlerSelectids', []); // 清空已勾选的商品id集合
          $message.success("付款成功，祝您购物愉快");
        } else $message.error("付款失败");
        loading.value = false; // 关闭动画
      })
      .catch(() => {
        $message.error("付款失败");
        loading.value = false; // 关闭动画
      });
  }, 3000);
};
</script>

<style lang="less" scoped>
.cart-footer {
  &__payment {
    position: sticky;
    bottom: 0;
    margin-top: 20px;
    color: #636060;
    .cardSty();

    .clear-cart {
      margin-left: 20px;

      &__has {
        color: inherit;
        transition: color 0.2s;

        &:hover {
          color: extract(@colors, 3);
        }
      }

      &__noHas {
        color: rgb(177, 173, 173);
        cursor: not-allowed;
      }
    }

    .payment {
      .sty(@direction) {
        float: @direction;
        height: 55px;
        display: flex;
        align-items: center;
        font-size: 13px;
      }

      &-left {
        .sty(left);

        &__spa {
          margin: 0 15px;
          background-color: #e0e0e0;
          width: 1px;
          height: 13px;
        }
      }

      &-right {
        .sty(right);
      }

      &-button {
        height: 55px;
        padding: 0 40px;
        border-radius: 0;
        margin-left: 40px;
        font-size: 18px;
        border: 0;
        background-color: extract(@colors, 3);
        color: extract(@colors, 4);

        &__has {
          transition: background-color 0.25s ease-in;
          cursor: pointer;
          .noselect();

          &:hover {
            background-color: #f58134;
            transition: background-color 0.35s ease-out;
          }
        }

        &__noHas {
          cursor: not-allowed;
          background-color: #fa9a5a;
        }
      }
    }

    .total-number {
      color: extract(@colors, 3);
      margin: 0 5px;
      font-size: 20px;
    }
  }

  &__delete {
    margin-right: 15px;

    &--checked {
      color: extract(@colors, 3);
      transition: color 0.2s;

      &:hover {
        color: #f57926;
      }
    }

    &--nochecked {
      cursor: not-allowed;
      color: rgb(177, 173, 173);
    }
  }
}
</style>