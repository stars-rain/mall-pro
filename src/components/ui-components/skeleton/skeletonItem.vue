<template>
  <div
    ref="skeletonImg"
    class="skeleton skeleton-img flex"
    :class="{ round, 'skeleton-animated': hasAnimated }"
    v-if="type === 'img'"
  >
    <img :src="require(`@/assets/empty/placeholder.220.png`)" />
  </div>
  <div
    ref="skeletonText"
    class="skeleton"
    :class="{ round, 'skeleton-animated': hasAnimated }"
    v-else-if="type === 'text'"
  ></div>
  <div
    ref="skeletonButton"
    class="skeleton"
    :class="{ round, 'skeleton-animated': hasAnimated }"
    v-else-if="type === 'button'"
  ></div>
  <div
    ref="skeletonCircle"
    class="skeleton skeleton-circle"
    :class="{ 'skeleton-animated': hasAnimated }"
    v-else-if="type === 'circle'"
  ></div>
</template>

<script lang="ts">
import {
  defineComponent,
  watchEffect,
  ref,
  defineProps,
  withDefaults,
  onMounted,
} from "@vue/runtime-core";
import type { Ref } from "@vue/runtime-core";

export default defineComponent({
  name: "skeletonItem",
  computed: {
    // 用户是否需要加载动画
    hasAnimated(): boolean {
      return (this.$parent as any).animated
    },
  },
});
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    width?: number | string; // 用户需要的骨架屏宽度
    height?: number | string; // 用户需要的骨架屏高度
    type?: string; // 骨架屏类型
    round?: boolean; // 用户是否需要圆角
  }>(),
  {
    type: "text",
    round: false,
  }
);
/**
 * 当前骨架屏的宽度
 */
let wid = ref<string | number>();
/**
 * 当前骨架屏的高度
 */
let hei = ref<string | number>();

/**
 * 给图片骨架屏元素一个ref属性
 */
let skeletonImg: Ref<HTMLDivElement> =
  ref<HTMLDivElement>() as Ref<HTMLDivElement>;
/**
 * 给文本骨架屏元素一个ref属性
 */
let skeletonText: Ref<HTMLDivElement> =
  ref<HTMLDivElement>() as Ref<HTMLDivElement>;
/**
 * 给按钮骨架屏元素一个ref属性
 */
let skeletonButton: Ref<HTMLDivElement> =
  ref<HTMLDivElement>() as Ref<HTMLDivElement>;
/**
 * 给按钮圆圈屏元素一个ref属性
 */
let skeletonCircle: Ref<HTMLDivElement> =
  ref<HTMLDivElement>() as Ref<HTMLDivElement>;

/**
 * 初始化骨架屏的高度和宽度
 * @param ele - 具体是哪个骨架屏元素
 * @param width - 骨架屏的默认宽度
 * @param height - 骨架屏的默认高度
 */
const initSty: (
  ele: Ref<HTMLDivElement>,
  width: number,
  height: number
) => void = (ele: Ref<HTMLDivElement>, width: number, height: number): void => {
  if (props.width === undefined || props.width === null)
    ele.value.style.width = `${width}px`;
  if (props.height === undefined || props.height === null)
    ele.value.style.height = `${height}px`;
};

onMounted(() => {
  switch (props.type) {
    case "img":
      initSty(skeletonImg, 300, 300);
      break;
    case "text":
      initSty(skeletonText, 300, 25);
      break;
    case "button":
      initSty(skeletonButton, 80, 40);
      break;
    case "circle":
      initSty(skeletonCircle, 40, 40);
      break;
  }
});

watchEffect(() => {
  wid.value =
    typeof props.width === "number" ? props.width + "px" : props.width;
  hei.value =
    typeof props.height === "number" ? props.height + "px" : props.height;
});
</script>

<style lang="less" scoped>
.round {
  border-radius: 3px;
}

.skeleton {
  background-image: linear-gradient(
    to right,
    #eeeded 30%,
    rgba(250, 249, 249, 0.952) 45%,
    #eeeded 68%
  );
  background-size: 400% 100%;
  .setWidHei(v-bind(wid), v-bind(hei));
  margin-bottom: 16px;

  &-animated {
    animation: skeleton-loading 1.3s ease-in-out infinite;
  }

  &-img {
    img {
      .setWidHei(50%, 50%);
    }
  }

  &-circle {
    border-radius: 50%;
  }
}
@keyframes skeleton-loading {
  0% {
    background-position: 100%;
  }

  100% {
    background-position: 0;
  }
}
</style>