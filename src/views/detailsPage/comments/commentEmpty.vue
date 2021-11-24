<template>
  <div class="comment-empty">
    <svg-icon popper-class="icon-empty" icon-class="empty"></svg-icon>
    <p>暂无评论数据，快去发表一个吧</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "comment-empty",
});
</script>

<style lang="less" scoped>
.icon-empty {
  .setWidHei(150px, 150px);
}
.comment-empty {
  text-align: center;
  margin-top: 20px;
  color: #b0b0b0;
}
</style>