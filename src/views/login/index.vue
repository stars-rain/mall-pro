<template>
  <n-message-provider>
    <div class="reglog flex">
      <div class="reglog-box clearfix">
        <div class="reglog-box__left"></div>
        <router-link
          v-if="!loading"
          title="返回首页"
          to="/"
          class="left-img"
        ></router-link>
        <div v-else style="cursor: not-allowed" class="left-img"></div>
        <div class="reglog-box__right flex">
          <div>
            <login-form :title="title" v-model:loading="loading"></login-form>
          </div>
        </div>
      </div></div
  ></n-message-provider>
</template>

<script lang="ts">
import {
  defineComponent,
  defineProps,
  ref,
  onBeforeMount,
  onBeforeUnmount,
} from "@vue/runtime-core";
import loginForm from "./login.vue";

export default defineComponent({
  name: "loginIndex",
  components: {
    loginForm,
  },
});
</script>

<script lang="ts" setup>
defineProps<{
  /**
   * 用户需要登录还是注册
   */
  title: string;
}>();

/**
 * 该组件的根元素的高度
 */
let winHei = ref<string>("");

/**
 * 浏览器的可视高度改变则组件的根元素的高度也随之改变
 */
const handleToWid: () => void = (): void => {
  // 获取浏览器的可视高度
  const hei: number =
    window.innerHeight ||
    document.body.clientHeight ||
    document.documentElement.clientHeight;
  if (hei <= 400) {
    winHei.value = "400px";
    return;
  }
  winHei.value = `${hei}px`;
};
// 给浏览器添加监听窗口大小变化的事件
window.addEventListener("resize", handleToWid);
// 初始化组件根元素的高度
onBeforeMount(() => handleToWid());
// 组件卸载前移除该事件
onBeforeUnmount(() => window.removeEventListener("resize", handleToWid));

/**
 * 用户点击注册或登录按钮时显示'注册中'或'登录中'
 */
let loading = ref<boolean>(false);
</script>

<style lang="less" scoped>
.reglog {
  height: v-bind(winHei);
  background: url("../../../public/reglogbagimg.jpg") no-repeat center;
  background-size: 100% 100%;

  &-box {
    position: relative;
    .setWidHei(900px, 400px);

    &__left {
      float: left;
      .setWidHei(400px, 100%);
      background-color: extract(@colors, 4);
      opacity: 0.1;
    }

    .left-img {
      position: absolute;
      top: 50%;
      left: 125px;
      transform: translate3d(0, -50%, 0);
      .setWidHei(150px, 150px);

      &::before {
        display: table;
        content: "";
        position: absolute;
        .setWidHei(150px, 150px);
        top: 0;
        background: url("~@/assets/logo.png");
        transform: translate3d(0, 0, 0);
        background-size: 150px 150px;
        opacity: 0.9;
      }
    }

    &__right {
      float: left;
      .setWidHei(500px, 100%);
      background-color: extract(@colors, 4);
    }
  }
}
</style>