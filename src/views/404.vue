<template>
  <div class="not-found">
    <span class="col">4</span>
    <span class="col col-two">0</span>
    <span class="col">4</span>
    <h2>抱歉，出错了...</h2>
    <div class="not-found__message">
      您所访问的页面丢失啦 <span class="countdown">{{ second }}</span> 秒后自动
      <a href="javascript:void(0)" @click="goIndex">返回首页</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "404",
  beforeMount() {
    // 将页面url改为/404
    history.replaceState({ pageName: "404" }, "", "/404");
  },
});
</script>

<script lang="ts" setup>
import { useRouter } from "vue-router";
const $router = useRouter();
/**
 * @type {number} 返回首页的倒计时
 */
const second = ref<number>(5);
/**
 * @return {number} 倒计时5s回到首页
 */
const timing: () => number = (): number => {
  let timing: number;
  timing = setInterval(() => {
    second.value -= 1;
    if (second.value === 0) {
      clearInterval(timing); // 清除倒计时函数
      $router.replace({ path: "/" });
    }
  }, 1000);
  return timing;
};

let tempTime: number = timing();

/* 点击返回首页清除定时函数 */
const goIndex: () => void = (): void => {
  clearInterval(tempTime);
  $router.replace('/');
};
</script>

<style lang="less" scoped>
.not-found {
  .setWidHei(80%, 340px);
  text-align: center;
  margin: 20vh auto;
  background: url("~@/assets/404.png") no-repeat right;

  .col {
    font: 1000% sans-serif, "Arial Narrow Bold", Impact, Haettenschweiler;
    color: rgba(153, 154, 170, 1);
    -webkit-text-stroke-width: 2px;

    &-two {
      margin: 0 1vw;
    }
  }

  h2 {
    color: rgb(152, 152, 170);
  }

  &__message {
    margin-top: 10px;
    color: rgb(174, 174, 184);

    .countdown {
      font-size: 20px;
    }

    & > a {
      font-size: 17px;
      color: rgb(49, 49, 49);
      text-decoration: none;

      &:hover {
        color: rgb(245, 62, 62);
        text-decoration: underline;
      }
    }
  }
}
</style>