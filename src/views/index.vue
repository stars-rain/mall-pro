<template>
  <p>嘻嘻嘻嘻</p>
  <router-link to="/d">导航</router-link>
  <n-button>点击</n-button>
  <svg-icon icon-class="cart" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  name: "index",
  created() {
    axios.get("/").then((res) => {
      console.log(res);
    });
  },
});
</script>

<style lang="less" scoped>
</style>