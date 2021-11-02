<template>
  <div class="not-found">
    <span class="col">4</span>
    <span class="col col-two">0</span>
    <span class="col">4</span>
    <h2>抱歉，出错了...</h2>
    <div class="not-found__message">
      您所访问的页面丢失啦
      <a href="javascript:void(0)" @click="goIndex">返回首页</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "404",
  beforeMount() {
    // 将页面url改为/404
    history.replaceState({ pageName: "404" }, "", "/404");
  },
  methods: {
    /* 点击返回首页清除定时函数 */
    goIndex(): void {
      this.$router.replace("/");
    },
  },
});
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