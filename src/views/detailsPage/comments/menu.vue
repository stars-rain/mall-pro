<template>
  <transition name="menu-fade">
    <dl
      ref="commentMenu"
      class="comment-menu"
      v-show="modelValue"
      v-outClose="hanldeToShow"
    >
      <dt>
        <svg-icon popper-class="icon-menu" icon-class="like"></svg-icon>点赞
      </dt>
      <dt v-if="isSelf">
        <svg-icon popper-class="icon-menu" icon-class="delete"></svg-icon>删除
      </dt>
      <dt @click="replay">
        <svg-icon popper-class="icon-menu" icon-class="replay"></svg-icon>回复
      </dt>
    </dl></transition
  >
</template>

<script lang="ts">
import {
  defineComponent,
  withDefaults,
  defineProps,
  defineEmits,
  inject,
} from "@vue/runtime-core";
import outClose from "@/directives/vueClickClose";

export default defineComponent({
  name: "comment-menu",
  methods: {
    handlerToDirection(x: number, y: number): void {
      (
        this.$refs.commentMenu as HTMLDListElement
      ).style.cssText += `left:${x}px;top:${y}px`;
    },
  },
  expose: ["handlerToDirection"],
  directives: {
    outClose,
  },
});
</script>

<script lang="ts" setup>
import type { Ref } from "@vue/runtime-core";

/**
 * 当前商品的唯一id值
 */
let id: Ref<number> = inject("id") as Ref<number>;
const props = withDefaults(
  defineProps<{
    modelValue?: boolean; // 是否打开此组件
    isSelf?: boolean; // 用户是否正在操作自己的评论
    commentIndex?: number; // 用户操作的该条评论的index索引值
    commentName?: string; // 用户操作的该条评论的发表者
  }>(),
  {
    modelValue: false,
    isSelf: false,
    commentIndex: 0,
    commentName: "",
  }
);
const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void;
  (e: "replay", name: string, id: number): void; // 回复评论
}>();

// 改变该菜单的显示状态
const hanldeToShow: (show: boolean) => void = (show: boolean): void => {
  emits("update:modelValue", show);
};

// 回复评论
const replay: () => void = (): void => {
  emits("update:modelValue", false);
  emits("replay", props.commentName, props.commentIndex);
};
</script>

<style lang="less" scoped>
.menu-fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.25s;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
.icon-menu {
  font-size: 16px;
  margin-right: 5px;
  vertical-align: -3.3px;
}
.comment-menu {
  position: absolute;
  padding: 4px 3px 0;
  width: 136px;
  box-sizing: border-box;
  font-size: 14px;
  margin: 0;
  .cardSty();

  & > dt {
    padding: 3px 10px 3px 15px;
    margin-bottom: 2px;
    transition: background-color 0.2s;
    cursor: pointer;

    &:hover {
      background-color: #e4e4e4;
    }
  }
}
</style>