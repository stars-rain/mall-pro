<template>
  <transition name="backTop">
    <div v-show="showButton" class="back-top" @click="backTop">
      <svg-icon icon-class="caretTop"></svg-icon></div
  ></transition>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "backTop",
  props: {
    /* target: {
      // 触发滚动的目标
      type: String,
      required: true,
    }, */
    visibilityHeight: {
      // 滚动高度达到此参数值才出现
      type: Number,
      default: 200,
    },
    right: {
      // 返回顶部按钮距离页面右边距
      type: String,
      default: '50px',
    },
    bottom: {
      // 返回顶部按钮距离页面底部边距
      type: String,
      default: '60px',
    },
  },
  data() {
    return {
      /**
       * 是否显示返回顶部按钮
       */
      showButton: false,
      throttle: false, // 用于返回顶部函数backTopde的一个节流操作
    };
  },
  methods: {
    backTop(): void {
      // 返回顶部的操作
      if (this.throttle) return;
      this.throttle = true;
      const ele: HTMLElement = document.documentElement || document.body;
      // eslint-disable-next-line @typescript-eslint/no-inferrable-types
      let scrollHei: number = 10; // 作用是用于达到缓慢返回顶部
      const setTime = setInterval(() => {
        ele.scrollTop -= scrollHei;
        scrollHei += 10; // 作用是每次向上滚动的距离不同
        if (ele.scrollTop <= 0) {
          clearInterval(setTime);
          this.throttle = false;
        }
      }, 10);
      /* window.scrollTo({
        top: 0,
        behavior: 'smooth',
      }); */
    },
    /**
     * 当滚动条达到临界高度时则显示返回顶部按钮
     */
    appearButton(): void {
      const hei: number =
        document.body.scrollTop || document.documentElement.scrollTop;
      if (hei >= this.visibilityHeight) {
        // 如果滚动条的距离大于或等于滚动指定的高度则显示返回顶部按钮
        this.showButton = true;
      } else this.showButton = false;
    },
  },
  mounted() {
    // 如果此时滚动的高度已经满足条件则显示返回顶部按钮
    this.appearButton();
    // eslint-disable-next-line no-undef
    globalThis.onscroll = () => {
      this.appearButton();
    };
  },
});
</script>

<style lang="less" scoped>
.backTop {
  &-enter,
  &-leave {
    &-active {
      transition: opacity 0.1s;
    }
  }
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
.back {
  &-top {
    z-index: 130;
    cursor: pointer;
    position: fixed;
    right: v-bind(right);
    bottom: v-bind(bottom);
    .setWidHei(45px, 45px);
    line-height: 45px;
    color: extract(@colors, 3);
    background-color: extract(@colors, 4);
    border-radius: 50%;
    text-align: center;
    font-size: 28px;
    box-shadow: 0 0 6px rgb(0 0 0 / 12%);
    transition: all 0.3s;

    &:hover {
      background-color: extract(@colors, 3);
      color: extract(@colors, 4);
    }
  }
}
</style>