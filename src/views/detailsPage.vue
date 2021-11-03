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
    <div :class="{ details: true, 'details-login': !showPrompt }">
      <div
        :class="{
          'details-body': true,
          container: true,
          'details-body--login': !showPrompt,
        }"
      >
        <div class="details-body--img">
          <img src="../../public/reglogbagimg.jpg" alt="无法加载此图片" />
        </div>
      </div></div
  ></loading-bar>
</template>

<script lang="ts">
import {
  defineComponent,
  defineProps,
  watchEffect,
  computed,
  ref,
  watch,
} from "@vue/runtime-core";
import mallHeader from "@/components/header/header.vue";
import headerFooter from "../components/header/footer.vue";
import { mapActions } from "vuex";

export default defineComponent({
  name: "detailsPage",
  components: {
    mallHeader,
    headerFooter,
  },
  computed: {
    // 头部商品分类导航数据
    // eslint-disable-next-line no-undef
    commodityTypesDatas(): Array<CommodityTypes> {
      return this.$store.state.commodityTypesDatas;
    },
  },
  methods: {
    ...mapActions([
      "getCommodityTypesDatas", // 请求头部商品分类导航数据
    ]),
  },
  beforeMount() {
    this.$nextTick(() => {
      // 加载条开始滚动
      (this.$refs.loadingBar as any).start();
      // 请求头部商品分类导航数据、头部商品轮播图数据、手机以及家电商品数据
      Promise.all([this.getCommodityTypesDatas()])
        .then((res: boolean[]) => {
          // 数据全部获取成功则关闭加载条
          if (!res.includes(false)) (this.$refs.loadingBar as any).finish();
        })
        .catch(() => this.$router.replace("/404")); // 获取失败则定位到404页面
    });
  },
  watch: {},
});
</script>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import { useMessage } from "naive-ui";
import { useStore } from "@/store/index";
// import { $axios } from "@/plugins/axios";

const store = useStore();
const route = useRoute();
const $message = useMessage();
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

defineProps<{
  id: string;
  title: string;
}>();

watchEffect(() => {
  console.log(route.params.title, route.query.id);
});
</script>

<style lang="less" scoped>
.details {
  font-size: 16px;

  &-login {
    border-top: 1px solid transparent;
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
    margin-top: 50px;
    padding: 0 10px;

    &--img {
      .setWidHei(50%, 400px);

      img {
        .setWidHei(100%, 100%);
      }
    }

    &--login {
      margin-top: 50px;
    }
  }
}
</style>