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
            <n-message-provider>
              <details-content
                :title="title"
                :id="currentId"
                :commodity-details-datas="commodityDetailsDatas"
                :loading="loading"
              ></details-content>
              <comment :title="commodityDetailsDatas.name"></comment>
            </n-message-provider>
          </Skeleton>
        </div>
      </div>
    </div>
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
import backTop from "@/components/indexMain/backTop.vue";
import detailsContent from "./detailsContent.vue";
import comment from "./comments/comment.vue";
import Skeleton from "@/components/ui-components/skeleton/skeleton.vue";
import SkeletonItem from "@/components/ui-components/skeleton/skeletonItem.vue";
import { mapActions, mapState } from "vuex";
import Cookie from "@/plugins/cookie";
import { Base64 } from "js-base64";

export default defineComponent({
  name: "detailsPage",
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
    if (Number.isNaN(+(this.$props as any).id) || +(this.$props as any).id <= 0)
      this.$router.replace("/404");
    else {
      /**
       * cookie中登录用户的账号
       */
      const account: string = Cookie.getCookie().account;
      const boo: boolean =
        !this.$store.state.UserModule.isLogin && account && account.length === 8
          ? true
          : false;
      this.$nextTick(() => {
        // 加载条开始滚动
        (this.$refs.loadingBar as any).start();
        // 请求头部商品分类导航数据、头部商品轮播图数据、手机以及家电商品数据
        Promise.all([
          this.getCommodityTypesDatas(),
          this.getCommodityDetailsDatas({
            id: +(this.$props as any).id,
            account: Base64.encode(account),
          }),
          this.$store.dispatch("CommentModule/getComment", {
            id: +(this.$props as any).id,
            account: Base64.encode(account),
          }),
        ])
          .then((res: boolean[]) => {
            // 数据全部获取成功则关闭加载条
            if (!res.includes(false)) {
              if (boo) {
                this.$store
                  .dispatch("UserModule/getUserMessage", {
                    account: Base64.encode(account),
                  })
                  .then((res: boolean) => {
                    if (res)
                      this.$store.commit("UserModule/handleToAccount", {
                        account,
                      });
                    else Cookie.deleteCookie();
                    (this.$refs.loadingBar as any).finish();
                  })
                  .catch(() => {
                    Cookie.deleteCookie();
                    (this.$refs.loadingBar as any).finish();
                  });
              } else (this.$refs.loadingBar as any).finish();
            } else this.$router.replace("/404");
          })
          .catch(() => this.$router.replace("/404")); // 获取失败则定位到404页面
      });
    }
  },
  mounted() {
    // 向storage存储当前详情页所描述的商品的id值(作用是解决关于用户退出时收藏按钮的样式问题)
    sessionStorage.setItem("isDetailsPage", "yes");
  },
});
</script>

<script lang="ts" setup>
import { onBeforeRouteUpdate } from "vue-router";
import { useStore } from "@/store/index";

const store = useStore();

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
);

// 提供该商品id给内部组件用
provide("id", readonly(currentId));

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
  store.commit("CommentModule/$_clearComment"); // 清除缓存的评论数据
  // 更新数据
  Promise.all([
    store.dispatch("getCommodityDetailsDatas", {
      id: to.query.id,
      account: Base64.encode(store.state.UserModule.account),
    }),
    store.dispatch("CommentModule/getComment", {
      id: to.query.id,
      account: Base64.encode(store.state.UserModule.account),
    }),
  ]).then((res: boolean[]): void => {
    if (!res.includes(false)) {
      timing.value = setTimeout(() => (loading.value = false), 400);
    }
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

onBeforeUnmount(() => {
  store.commit("CommentModule/$_clearComment"); // 清除缓存的评论数据
  if (timing.value) clearTimeout(timing.value);
  sessionStorage.removeItem("isDetailsPage");
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

  &-body {
    padding: 40px 10px 20px;
    box-sizing: border-box;

    &--img,
    :deep(.details-conimg) {
      .setWidHei(50%, 400px);
      float: left;
      overflow: hidden;
    }

    &--content,
    :deep(.details-con) {
      width: 50%;
      box-sizing: border-box;
      padding: 0 15px;
      float: right;
    }
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
}
</style>