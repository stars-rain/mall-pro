<template>
  <svg :class="svgClass" aria-hidden="true">
    <title v-if="title">{{ title }}</title>
    <use :xlink:href="iconName" />
  </svg>
</template>

<script lang="ts">
import { defineComponent, withDefaults, defineProps, computed } from "@vue/runtime-core";

export default defineComponent({
  name: "SvgIcon",
});
</script>

<script lang="ts" setup>
interface Props {
  iconClass: string;
  popperClass?: string;
  title?: string;
}
const props = withDefaults(defineProps<Props>(), {
  popperClass: '',
  title: '',
})
/**
 * icon图标的对应名称(位置)
 */
const iconName = computed(() => `#icon-${props.iconClass}`);
/**
 * icon图标的对应的class类名(用作css样式)
 */
const svgClass = computed(() => props.popperClass ? "svg-icon " + props.popperClass : "svg-icon")
</script>

<style lang="less" scoped>
.svg-icon {
  .setWidHei(1em, 1em);
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>