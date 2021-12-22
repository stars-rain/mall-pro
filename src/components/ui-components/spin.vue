<template>
  <div class="spin">
    <div
      :class="{
        'spin-circle': true,
        'active-circle': index === activeIndex,
        'spin-nolast': index !== 4,
      }"
      v-for="index in 4"
      :key="index"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "spin",
  data() {
    return {
      activeIndex: 1, // 当前显示高亮背景色的圆圈
      timing: 0, // 记录setInterval函数方便清除
    }
  },
  mounted() {
    this.timing = setInterval(() => {
      this.activeIndex ++; 
      if (this.activeIndex === 5) this.activeIndex = 1;
    }, 150);
  },
  beforeUnmount() {
    if (this.timing) clearInterval(this.timing);
  },
});
</script>

<style lang="less" scoped>
.spin {
  display: inline-block;
  overflow: hidden;

  &-circle {
    display: inline-block;
    .setWidHei(7px, 7px,);
    background-color: #fadbc6;
    border-radius: 50%;
    transition: background-color .3s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  &-nolast {
    margin-right: 10px;
  }
}
.active-circle {
  background-color: extract(@colors, 3);
}
</style>