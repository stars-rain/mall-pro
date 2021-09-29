<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">{{ count }}</router-link>
    <n-button type="Error" size="tiny">点击我</n-button>
    <n-divider></n-divider>
  </div>
  <router-view/>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: 'App',
})
</script>

<script lang="ts" setup>
import { ref } from "vue";

const count = ref<string>(10);
</script>

<style lang="less" scoped>
#nav {
  a {
    color: red;
  }
}
</style>
