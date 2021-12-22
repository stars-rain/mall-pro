<template>
  <n-popover
    style="padding-right: 8px"
    placement="bottom-start"
    trigger="hover"
    :z-index="5666"
  >
    <template #trigger>
      <svg-icon icon-class="smile" popper-class="icon-smile"></svg-icon>
    </template>
    <scroll-bar :contentHei="365">
      <template v-for="item in emotionsDatas" :key="item.id">
        <img
          class="emotion"
          draggable="false"
          :src="`https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/${item.id}.gif`"
          :title="item.emotion"
          @click="addEmotion(item.emotion)"
        />
      </template>
    </scroll-bar>
  </n-popover>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import type { Emotion } from "@/staticDatas/interface";
import scrollBar from "@/components/ui-components/scrollBar.vue";
import { insertEmotions } from "./utils/insertEmotions";

export default defineComponent({
  name: "emotions",
  components: {
    scrollBar,
  },
  props: {
    /**
     * 表情数据数组
     */
    emotionsDatas: {
      type: Array as PropType<Array<Emotion>>,
      required: true,
    },
    /**
     * 评论内容
     */
    modelValue: {
      type: String,
      default: "",
    },
    /**
     * 评论输入框
     */
    commentInpEle: {
      type: HTMLTextAreaElement,
    },
  },
  emits: ["update:modelValue"],
  methods: {
    /**
     * 在输入框中插入表情
     * @param emotion - 具体哪个表情
     */
    addEmotion(emotion: string): void {
      // 获取输入框元素
      this.$emit(
        "update:modelValue",
        insertEmotions(this.commentInpEle!, this.modelValue)(emotion)
      );
    },
  },
});
</script>

<style lang="less" scoped>
.emotion {
  .noselect();
  cursor: pointer;
  margin-right: 2px;
}
</style>