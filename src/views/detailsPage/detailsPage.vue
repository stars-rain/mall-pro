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
        <div class="details-body container clearfix">
          <div class="details-body--img flex">
            <img src="../../../public/reglogbagimg.jpg" alt="无法加载此图片" />
          </div>
          <div class="details-body--content">
            <h2 class="details-name">小米电视6 65″OLED</h2>
            <p class="details-desc">
              【立即预约5号到手价6999元！3期免息】【5号电视品类日】【价保30天，买贵补差】4K
              OLED,更薄更清晰,0nit极夜黑,低蓝光认证,全场景互联
            </p>
            <p class="details-price">99999元起</p>
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
                  <span>电话号码：</span
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
            <button class="add-cart">加入购物车</button>
          </div>
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
  </loading-bar>
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
import headerFooter from "@/components/header/footer.vue";
import { mapActions, mapState } from "vuex";
import Cookie from "@/plugins/cookie";
import { Base64 } from "js-base64";
import myDialog from "@/components/ui-components/myDialog.vue";
import userFormItem from "./userFormItem.vue";

export default defineComponent({
  name: "detailsPage",
  components: {
    mallHeader,
    headerFooter,
    myDialog,
    userFormItem,
  },
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
    ...mapState("UserModule", ["name", "telephone", "address"]),
  },
  methods: {
    ...mapActions([
      "getCommodityTypesDatas", // 请求头部商品分类导航数据
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
      ])
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

defineProps<{
  id: string;
  title: string;
}>();
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

watchEffect(() => {
  console.log(route.params.title, route.query.id);
});
</script>

<style lang="less" scoped>
.details {
  font-size: 16px;
  padding-top: 20px;

  &-box {
    background-color: #f5f5f5;
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

      img {
        .setWidHei(80%, 80%);
      }
    }

    &--content {
      .setWidHei(50%, 400px);
      box-sizing: border-box;
      padding: 0 10px;
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
    color: extract(@colors, 3);
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
  border-radius: 3px;
  background-color: extract(@colors, 3);
  color: extract(@colors, 4);
  transition: background-color 0.25s ease-in;
  border: 0;
  cursor: pointer;

  &:hover {
    background-color: #f58134;
    transition: background-color 0.35s ease-out;
  }
}
</style>