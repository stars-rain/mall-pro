<template>
  <loading-bar ref="loadingBar">
    <!-- 商城头部组件 -->
    <n-message-provider>
      <mallHeader>
        <header-footer
          :commodity-types-datas="commodityTypesDatas"
        ></header-footer> </mallHeader
    ></n-message-provider>
    <collapse-transition>
      <div class="details-buy--prompt" v-if="showPrompt">
        为了方便您购买，请提前
        <router-link
          class="header-nav"
          :to="{ name: 'reglog', params: { title: 'login' } }"
          >登录</router-link
        >
        <svg-icon
          popper-class="dialog-close"
          style="vertical-align: -5px"
          icon-class="close"
          @click="showPrompt = false"
        ></svg-icon></div
    ></collapse-transition>
    <div class="details">
      <div class="details-box">
        <div class="details-body container">
          <Skeleton :loading="loading" animated>
            <template #skeleton>
              <div class="clearfix">
                <div class="details-body--img flex">
                  <skeleton-item
                    :width="400"
                    :height="400"
                    type="img"
                  ></skeleton-item>
                </div>
                <div class="details-body--content">
                  <skeleton-item width="100%"></skeleton-item>
                  <div style="margin: 30px 0">
                    <skeleton-item
                      style="display: inline-block; margin-bottom: 0"
                      :width="70"
                    ></skeleton-item>
                    <skeleton-item
                      style="
                        margin-left: 20px;
                        display: inline-block;
                        margin-bottom: 0;
                      "
                      :width="70"
                    ></skeleton-item>
                  </div>
                  <template v-for="index in 3" :key="index">
                    <skeleton-item
                      style="margin-bottom: 35px"
                      :width="160"
                    ></skeleton-item>
                  </template>
                  <skeleton-item
                    type="button"
                    style="margin-bottom: 0"
                  ></skeleton-item>
                </div>
              </div>
              <skeleton-item :width="80"></skeleton-item>
              <skeleton-item
                style="margin: 20px 0 30px 0"
                width="60%"
              ></skeleton-item>
            </template>
            <div class="clearfix">
              <div
                :class="{
                  'details-body--img': true,
                  'details-body--img__loading': !loading,
                }"
              >
                <carousel-details-page
                  :datas="commodityDetailsDatas.imgDetails"
                  width="90%"
                  :height="400"
                ></carousel-details-page>
              </div>
              <div class="details-body--content">
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
                      <span>手机号码：</span
                      >{{ telephone ? telephone : "请设置手机号码"
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
                      <span>收货地址：</span
                      >{{ address ? address : "请设置收货地址"
                      }}<span
                        class="user-messages__modify"
                        @click="handleToMess('修改收货地址')"
                        >修改</span
                      >
                    </p>
                  </div>
                </div>
                <button class="add-cart" @click="addCart">加入购物车</button>
              </div>
            </div>
            <n-message-provider>
              <comment :title="'小米电视6 65″OLED'"></comment>
            </n-message-provider>
          </Skeleton>
        </div>
      </div>
    </div>
    <n-message-provider>
      <my-dialog
        v-model="showDialog"
        :title="currentOpeartion"
        :close="!loading"
      >
        <user-form-item
          ref="user_formItem"
          v-model:opeartion-type="currentOpeartion"
          v-model:loading="loading"
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
      </my-dialog></n-message-provider
    >
    <back-top></back-top>
  </loading-bar>
</template>

<script lang="ts">
import {
  defineComponent,
  defineProps,
  computed,
  ref,
  watch,
  onBeforeUnmount,
  provide,
  readonly,
} from "@vue/runtime-core";
import mallHeader from "@/components/header/header.vue";
import headerFooter from "@/components/header/footer.vue";
import myDialog from "@/components/ui-components/myDialog.vue";
import userFormItem from "./userFormItem.vue";
import backTop from "@/components/indexMain/backTop.vue";
import comment from "./comments/comment.vue";
import Skeleton from "@/components/ui-components/skeleton/skeleton.vue";
import SkeletonItem from "@/components/ui-components/skeleton/skeletonItem.vue";
import carouselDetailsPage from "./carousel/carouselIndex.vue";
import { mapActions, mapState } from "vuex";
import Cookie from "@/plugins/cookie";
import { Base64 } from "js-base64";

export default defineComponent({
  name: "detailsPage",
  data() {
    return {
      // 是否显示确认按钮的加载动画
      loading: false,
    };
  },
  computed: {
    // 头部商品分类导航数据
    // eslint-disable-next-line no-undef
    commodityTypesDatas(): Array<CommodityTypes> {
      return this.$store.state.commodityTypesDatas;
    },
    // 商品详情数据
    // eslint-disable-next-line no-undef
    commodityDetailsDatas(): CommodityDetails {
      return this.$store.state.commodityDetailsDatas;
    },
    ...mapState("UserModule", ["name", "telephone", "address"]),
  },
  methods: {
    ...mapActions([
      "getCommodityTypesDatas", // 请求头部商品分类导航数据
      "getCommodityDetailsDatas", // 请求商品详情数据
    ]),
  },
  beforeMount() {
    /**
     * cookie中登录用户的账号
     */
    const account: string = Cookie.getCookie().account;
    const boo: boolean =
      !this.$store.state.UserModule.isLogin && account && account.length === 8
        ? true
        : false;
    if (boo)
      // 刷新页面时如果cookie中有用户账号的话则把此账号保存到vuex的UserModule中
      this.$store.commit("UserModule/handleToAccount", { account });
    this.$nextTick(() => {
      // 加载条开始滚动
      (this.$refs.loadingBar as any).start();
      // 请求头部商品分类导航数据、头部商品轮播图数据、手机以及家电商品数据
      Promise.all([
        boo
          ? this.$store.dispatch("UserModule/getUserMessage", {
              account: Base64.encode(account),
            })
          : null,
        this.getCommodityTypesDatas(),
        this.getCommodityDetailsDatas({ id: +(this.$props as any).id }),
      ])
        .then((res: boolean[]) => {
          // 数据全部获取成功则关闭加载条
          if (!res.includes(false)) (this.$refs.loadingBar as any).finish();
        })
        .catch(() => this.$router.replace("/404")); // 获取失败则定位到404页面
    });
  },
});
</script>

<script lang="ts" setup>
import { onBeforeRouteUpdate } from "vue-router";
import { useMessage } from "naive-ui";
import { useStore } from "@/store/index";

const store = useStore();
const $message = useMessage();

const props = defineProps<{
  id: string; // 商品的唯一id值
  title: string; // 商品所属类型
}>();
let currentId = ref<number>(+props.id);

watch(
  (): string => props.id,
  (newValue: string): void => {
    currentId.value = +newValue;
  }
)

// 提供该商品id给内部组件用
provide('id', readonly(currentId));

/**
 * 是否加载骨架屏
 */
let loading = ref<boolean>(false);
/**
 * 保存计时函数如：setTimeout
 */
let timing = ref<number>(0);
onBeforeRouteUpdate((to): void => {
  // 开始加载骨架屏
  loading.value = true;
  // 更新数据
  store
    .dispatch("getCommodityDetailsDatas", { id: to.query.id })
    .then((value: boolean) => {
      if (value) timing.value = setTimeout(() => (loading.value = false), 400);
    });
});
/**
 * 用户是否登录
 */
let isLogin = computed(() => store.state.UserModule.isLogin);
/**
 * 是否显示登录提示
 */
let showPrompt = ref<boolean>(!isLogin.value);

watch(
  (): boolean => isLogin.value,
  (value): void => {
    // 观察用户是否登录从而是否显示登录提示
    showPrompt.value = !value;
  }
);

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

// 加入购物车
const addCart: () => void = (function (): () => void {
  // 节流
  let debounce: boolean = false;
  return (): void => {
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
        id: currentId.value,
      })
      .then((value: boolean): void => {
        if (value) {
          $message.success("成功加入购物车");
          if (store.state.CartModule.status !== 1)
            store.commit("CartModule/handleToStatus", { status: 1 }); // 用户成功修改了购物车状态
        } else $message.error("加入购物车失败");
        timing.value = setTimeout(() => {
          debounce = false;
        }, 300);
      })
      .catch(
        () =>
          (timing.value = setTimeout(() => {
            debounce = false;
            $message.error("加入购物车失败");
          }, 300))
      );
  };
})();

onBeforeUnmount(() => {
  if (timing.value) clearTimeout(timing.value);
});
</script>

<style lang="less" scoped>
.details {
  font-size: 16px;
  padding-top: 20px;

  &-box {
    background-color: #f5f5f5;
    padding-bottom: 10px;
  }

  &-buy--prompt {
    text-align: center;
    line-height: 50px;
    font-size: 14px;
    color: extract(@colors, 1);
    background-image: linear-gradient(#ecebeb, #fff);

    a {
      margin-right: 8px;
      color: extract(@colors, 3);
    }
  }

  &-body {
    padding: 40px 10px 20px;
    box-sizing: border-box;

    &--img {
      .setWidHei(50%, 400px);
      float: left;
      overflow: hidden;

      &__loading {
        background-color: extract(@colors, 4);
      }
    }

    &--content {
      width: 50%;
      box-sizing: border-box;
      padding: 0 15px;
      float: right;
    }
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
.add-cart {
  margin: 30px 0 0 10px;
  padding: 12px 15px;
  .submit();
}
</style>