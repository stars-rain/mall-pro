<template>
  <transition name="menu-fade">
    <dl
      ref="commentMenu"
      class="comment-menu"
      v-show="modelValue"
      v-outClose="hanldeToShow"
      @contextmenu.stop
    >
      <dt :class="{ 'like-color': comment?.isLiked, }" @click="$_handleToThumb(replayAttrs.commentId, fatherCommentId)">
        <svg-icon
          class="icon-menu"
          icon-class="like"
        ></svg-icon
        >点赞
        <span v-if="comment?.thumb">({{ comment?.thumb }})</span>
      </dt>
      <dt v-if="isSelf" @click="handleToDialog(true)">
        <svg-icon popper-class="icon-menu" icon-class="delete"></svg-icon>删除
      </dt>
      <dt @click="replay">
        <svg-icon popper-class="icon-menu" icon-class="replay"></svg-icon>回复
        <span v-if="comment?.replayCount">({{ comment?.replayCount }})</span>
      </dt>
    </dl></transition
  >
  <my-dialog v-model="showDialog">
    <div class="dialog-prompt">
      <svg-icon popper-class="icon-warn" icon-class="warn"></svg-icon>
      确定删除该条评论
    </div>
    <template #footer>
      <n-button @click="showDialog = false" size="medium" color="#cac8c8"
        >取消</n-button
      >
      <n-button
        color="#ff6700"
        size="medium"
        @click="deleteComment(replayAttrs.type, comment)"
        >确认</n-button
      >
    </template>
  </my-dialog>
</template>

<script lang="ts">
import {
  defineComponent,
  withDefaults,
  defineProps,
  defineEmits,
  ref,
  inject,
} from "@vue/runtime-core";
import outClose from "@/directives/vueClickClose";

export default defineComponent({
  name: "comment-menu",
  computed: {
    userName(): string {
      return this.$store.state.UserModule.userName;
    },
  },
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
import { useStore } from "@/store/index";
import { useMessage } from "naive-ui";
import myDialog from "@/components/ui-components/myDialog.vue";
import { Base64 } from "js-base64";
import { source } from "@/plugins/axios"

const store = useStore();
const $message = useMessage();
const props = withDefaults(
  defineProps<{
    modelValue?: boolean; // 是否打开此组件
    isSelf?: boolean; // 用户是否正在操作自己的评论
    fatherCommentId: number; // 一级评论的id值
    // eslint-disable-next-line no-undef
    comment: Comments; // 当前的某条评论
    // 回复属性(包括被回复的用户名、被回复的评论的索引值)
    replayAttrs: {
      type: number; // 用户是回复评论还是回复评论的评论
      replaiedName: string; // 被回复的用户名
      commentId: number; // 被回复的评论的id值
    };
  }>(),
  {
    modelValue: false,
    isSelf: false,
  }
);
const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void;
  (
    e: "replay",
    gener: number,
    type: number,
    name: string,
    fatherId: number,
    id: number
  ): void; // 回复评论
}>();
/**
 * 用户点赞
 * @param account - 当前登录用户的账号
 * @param commentId - 评论的id值
 * @param fatherCommentId - 一级评论的id值
 */
const handleToThumb: (
  account: string,
  commentId: number,
  fatherCommentId: number
) => void = inject("handleToThumb") as (
  account: string,
  commentId: number,
  fatherCommentId: number
) => void;
/**
 * 点赞逻辑
 * @param commentId - 该条评论的id值
 * @param fatherCommentId - 该条评论对应的一级评论的id值
 */
const $_handleToThumb: (commentId: number, fatherCommentId: number) => void = (
  commentId: number,
  fatherCommentId: number
): void => {
  if (!store.state.UserModule.isLogin) $message.error("请先登录");
  else {
    handleToThumb(
      Base64.encode(store.state.UserModule.account),
      commentId,
      fatherCommentId
    );
    emits("update:modelValue", false); // 关闭该菜单
  }
};

// 改变该菜单的显示状态
const hanldeToShow: (show: boolean) => void = (show: boolean): void => {
  emits("update:modelValue", show);
};

// 回复评论
const replay: () => void = (): void => {
  if (!props.replayAttrs.replaiedName) $message.error("请先登录");
  else {
    emits("update:modelValue", false); // 关闭该菜单
    emits(
      "replay",
      1,
      props.replayAttrs.type,
      props.replayAttrs.replaiedName,
      props.fatherCommentId,
      props.replayAttrs.commentId
    );
  }
};

/**
 * 是否显示提示对话框
 */
let showDialog = ref<boolean>(false);
/**
 * 打开提示对话框
 */
const handleToDialog: (show: boolean) => void = (show: boolean): void => {
  showDialog.value = show;
  emits("update:modelValue", false); // 关闭该菜单
};
/**
 * 删除评论
 * @param type - 状态码，判断用户是删除评论还是删除某条评论的回复评论(0代表删除评论)
 * @param comment - 当前评论
 */
// eslint-disable-next-line no-undef
const deleteComment: (type: number, comment: Comments) => void = (
  type: number,
  // eslint-disable-next-line no-undef
  comment: Comments
): void => {
  // 如果用户正在请求该评论的二级评论，则取消请求
  if (comment.loading) {
    // 取消请求二级评论的请求
    source.cancel();
    comment.loading = false;
  }
  showDialog.value = false; // 关闭对话框
  setTimeout(() => {
    if (type === 0) {
      store
        .dispatch("CommentModule/deleteComment", {
          commentId: props.replayAttrs.commentId,
        })
        .then((res: boolean): void => {
          if (res) $message.success("删除成功");
        })
        .catch(() => $message.error("删除失败"));
    } else if (type === 1) {
      store
        .dispatch("CommentModule/deleteComment", {
          commentId: props.replayAttrs.commentId,
          fatherCommentId: props.fatherCommentId,
        })
        .then((res: boolean): void => {
          if (res) $message.success("删除成功");
        })
        .catch(() => $message.error("删除失败"));
    }
  }, 400);
};
</script>

<style lang="less" scoped>
.like-color {
  color: extract(@colors, 3);
}
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
  box-sizing: border-box;
  font-size: 14px;
  margin: 0;
  .cardSty();

  & > dt {
    padding: 3px 35px 3px 15px;
    margin-bottom: 2px;
    transition: background-color 0.2s;
    cursor: pointer;

    &:hover {
      background-color: #e4e4e4;
    }
  }
}
</style>