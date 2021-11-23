<template>
  <div class="skeleton-container" v-if="loading">
    <slot v-bind="$attrs" name="skeleton"></slot>
  </div>
  <slot v-else></slot>
</template>

<script lang="ts">
import {
  defineComponent,
  watchEffect,
  ref,
  defineProps,
  withDefaults,
  defineExpose,
} from "@vue/runtime-core";

export default defineComponent({
  name: "skeleton",
});
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    width?: number | string; // 用户需要的骨架屏宽度
    height?: number | string; // 用户需要的骨架屏高度
    loading?: boolean; // 是否显示骨架屏
    animated?: boolean; // 是否显示加载动画
  }>(),
  {
    loading: false,
    animated: false,
  }
);

defineExpose({
  animated: props.animated,
});

/**
 * 当前骨架屏盒子的宽度
 */
let wid = ref<string | number>();
/**
 * 当前骨架屏盒子的高度
 */
let hei = ref<string | number>();
watchEffect(() => {
  wid.value =
    typeof props.width === "number" ? props.width + "px" : props.width;
  hei.value =
    typeof props.height === "number" ? props.height + "px" : props.height;
});
</script>

<style lang="less" scoped>
.skeleton {
  &-container {
    .setWidHei(v-bind(width), v-bind(height));
  }
}
</style>