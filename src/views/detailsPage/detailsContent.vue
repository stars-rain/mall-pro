<template>
  <div class="clearfix">
    <div
      :class="{
        'details-conimg': true,
        'details-conimg__loading': !loading,
      }"
    >
      <carousel-details-page
        :datas="commodityDetailsDatas.imgDetails"
        width="90%"
        :height="400"
      ></carousel-details-page>
    </div>
    <div class="details-con">
      <h2 class="details-name">{{ commodityDetailsDatas.name }}</h2>
      <p class="details-desc">
        {{ commodityDetailsDatas.saleDesc }}
      </p>
      <p class="details-price">
        <span class="details-price--cur">
          {{ commodityDetailsDatas.curPrice }}
        </span>
        <del class="details-price--ori">{{
          commodityDetailsDatas.oriPrice
        }}</del>
      </p>
      <div class="details-card">
        <div class="card-title">收货信息</div>
        <div class="user-messages">
          <p class="user-messages__item">
            <svg-icon
              popper-class="user-icon__messages"
              icon-class="receiver"
            ></svg-icon>
            <span>收货人：</span>{{ name ? name : "请设置收货人" }}
            <span
              class="user-messages__modify"
              @click="handleToMess('修改收货人姓名')"
              >修改</span
            >
          </p>
          <p class="user-messages__item">
            <svg-icon
              popper-class="user-icon__messages"
              icon-class="cellPhone"
            ></svg-icon>
            <span>手机号码：</span>{{ telephone ? telephone : "请设置手机号码"
            }}<span
              class="user-messages__modify"
              @click="handleToMess('修改手机号码')"
              >修改</span
            >
          </p>
          <p class="user-messages__item">
            <svg-icon
              popper-class="user-icon__messages"
              icon-class="location"
            ></svg-icon>
            <span>收货地址：</span>{{ address ? address : "请设置收货地址"
            }}<span
              class="user-messages__modify"
              @click="handleToMess('修改收货地址')"
              >修改</span
            >
          </p>
        </div>
      </div>
      <button class="add-cart" @click="addCart(id)">加入购物车</button>
      <button
        :class="{
          'button-collectNo': !commodityDetailsDatas.isLove,
          'button-collectYes': commodityDetailsDatas.isLove,
        }"
        @click="handleToCollect(commodityDetailsDatas)"
      >
        <template v-if="!commodityDetailsDatas.isLove">
          <svg-icon icon-class="love" popper-class="isLove"></svg-icon>
          <span>收藏</span>
        </template>
        <template v-else>
          <svg-icon icon-class="noLove" popper-class="isLove"></svg-icon>
          <span>取消收藏</span>
        </template>
      </button>
    </div>
  </div>
  <my-dialog v-model="showDialog" :title="currentOpeartion" :close="!loading">
    <user-form-item
      ref="user_formItem"
      v-model:opeartion-type="currentOpeartion"
      v-model:loading="confirmLoading"
      v-model:show-dialog="showDialog"
    ></user-form-item>
    <template #footer>
      <n-button
        @click="showDialog = false"
        :disabled="loading"
        attr-type="button"
        size="medium"
        >取消</n-button
      >
      <n-button
        type="info"
        size="medium"
        attr-type="button"
        :loading="loading"
        @click="submit(currentOpeartion)"
        >{{ loading ? "确认中" : "确认" }}</n-button
      >
    </template>
  </my-dialog>
</template>

<script lang="ts">
import {
  defineComponent,
  withDefaults,
  defineProps,
  ref,
} from "@vue/runtime-core";
import { mapState } from "vuex";

export default defineComponent({
  name: "details-content",
  computed: {
    ...mapState("UserModule", ["name", "telephone", "address"]),
  },
  data() {
    return {
      // 是否显示确认按钮的加载动画
      confirmLoading: false,
    };
  },
});
</script>

<script lang="ts" setup>
import carouselDetailsPage from "./carousel/carouselIndex.vue";
import myDialog from "@/components/ui-components/myDialog.vue";
import userFormItem from "./userFormItem.vue";
import { useMessage } from "naive-ui";
import { useStore } from "@/store/index";
import { Base64 } from "js-base64";

const props = withDefaults(
  defineProps<{
    id: number;
    title: string; // 商品所属类型
    // eslint-disable-next-line no-undef
    commodityDetailsDatas: CommodityDetails; // 商品详情数据
    loading?: boolean; // 骨架屏是否加载完毕
  }>(),
  {
    loading: false,
  }
);
const store = useStore();
const $message = useMessage();

/**
 * 用户当前修改哪项信息的具体操作名称
 */
let currentOpeartion = ref<string>("");
/**
 * 是否显示对话框
 */
let showDialog = ref<boolean>(false);
/**
 * 给user-form组件一个ref属性
 */
let user_formItem = ref<InstanceType<typeof userFormItem>>();

/**
 * 单独修改用户收获收货信息
 * * @param type - 修改信息的类型
 */
const handleToMess: (type: string) => void = (type: string): void => {
  if (!store.state.UserModule.isLogin) {
    $message.error("请先登录");
    return;
  }
  currentOpeartion.value = type; // 用户当前修改信息的类型
  showDialog.value = true; // 打开对话框
};
/**
 * 确认修改用户信息(向后端发送请求)
 * @param type - 修改信息的类型
 */
const submit: (type: string) => void = (type: string): void => {
  (user_formItem.value as any).submit(type);
};

/**
 * 加入购物车
 * @param id - 商品的唯一id值
 */
const addCart: (id: number) => void = (function (): (id: number) => void {
  // 节流
  let debounce: boolean = false;
  return (id: number): void => {
    if (debounce) return;
    debounce = true;
    if (!store.state.UserModule.isLogin) {
      $message.error("请先登录");
      debounce = false;
      return;
    }
    // 向后台发送数据
    store
      .dispatch("CartModule/sendCartDatas", {
        account: Base64.encode(store.state.UserModule.account),
        id,
      })
      .then((value: boolean): void => {
        if (value) {
          $message.success("成功加入购物车");
          if (store.state.CartModule.status !== 1)
            store.commit("CartModule/handleToStatus", { status: 1 }); // 用户成功修改了购物车状态
        } else $message.error("加入购物车失败");
        setTimeout(() => {
          debounce = false;
        }, 300);
      })
      .catch(() =>
        setTimeout(() => {
          debounce = false;
          $message.error("加入购物车失败");
        }, 300)
      );
  };
})();

/**
 * 用户收藏该件商品或者取消其收藏
 */
// eslint-disable-next-line no-undef
const handleToCollect: (datas: CommodityDetails) => void = ((): ((
  // eslint-disable-next-line no-undef
  datas: CommodityDetails
) => void) => {
  /**
   * 防抖
   */
  let debounce: boolean = false;
  // eslint-disable-next-line no-undef
  return (datas: CommodityDetails): void => {
    if (debounce) return;
    debounce = true;
    if (!store.state.UserModule.isLogin) {
      $message.error("请先登录");
      debounce = false;
      return;
    }
    store
      .dispatch("CollectModule/addCollect", {
        id: props.id,
        account: Base64.encode(store.state.UserModule.account),
      })
      .then((res: boolean) => {
        if (res) {
          datas.isLove = !datas.isLove;
          if (datas.isLove) $message.success("收藏成功");
          else $message.success("取消成功");
        } else if (!datas.isLove) $message.error("收藏失败");
        else $message.error("取消失败");
        debounce = false;
      })
      .catch(() => {
        if (!datas.isLove) $message.error("收藏失败");
        else $message.error("取消失败");
        debounce = false;
      });
  };
})();
</script>

<style lang="less" scoped>
.details {
  &-conimg__loading {
    background-color: extract(@colors, 4);
  }

  &-name {
    margin: 0;
    font-weight: 400;
  }

  &-desc {
    font-size: 15px;
    color: #b0b0b0;
  }

  &-price {
    font-size: 18px;

    &--cur {
      color: extract(@colors, 3);
    }

    &--ori {
      color: #b0b0b0;
      margin-left: 8px;
    }
  }

  &-card {
    background-color: extract(@colors, 4);
    transition: all 0.25s;
    border-radius: 3px;

    &:hover {
      box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08),
        0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04);
    }

    .card {
      &-title {
        padding: 19px 0 16px 19px;
        font-weight: 500;
        color: extract(@colors, 2);
      }
    }
  }
}

.user {
  &-messages {
    padding: 0 0 20px 19px;
    color: #6b6a6a;
    font-size: 14px;

    &__item {
      margin: 0 0 8px;

      span {
        margin-left: 5px;
      }
    }

    &__modify {
      font-size: 15px;
      color: extract(@colors, 3);
      margin-left: 5px;
      cursor: pointer;
      transition: color 0.25s ease-in;

      &:hover {
        color: #f58134;
        transition: color 0.35s ease-out;
      }
    }
  }

  &-icon__messages {
    font-size: 16px;
  }
}

.buttonSty(@left, @bkColor, @color, @hoverBkColor) {
  margin: 30px 0 0 @left;
  .setWidHei(100px, 42px);
  .submit(@bkColor, @color,  @hoverBkColor);
}
.add-cart {
  .buttonSty(10px, extract(@colors, 3), extract(@colors, 4), #f58134);
}

.button {
  &-collectNo {
    .buttonSty(40px, #b0b0b0, extract(@colors, 4), #b8b8b8);
  }

  &-collectYes {
    .buttonSty(40px, extract(@colors, 3), extract(@colors, 4), #f58134);
  }
}
.isLove {
  font-size: 16px;
  vertical-align: -3px;
  margin-right: 3px;
}
</style>