<template>
  <div class="comment">
    <span class="comment-title">用户评价 ({{ commentListDatas.length }})</span>
    <div class="comment-spa"></div>
    <n-input
      class="comment-input--disabled"
      @click="isComment(0)"
      placeholder="评论一下吧"
      :disabled="true"
      ><template #prefix><svg-icon icon-class="comment"></svg-icon></template>
      <template #suffix
        ><svg-icon
          popper-class="icon-smile"
          icon-class="smile"
        ></svg-icon></template
    ></n-input>
    <comment-list
      v-if="commentListDatas.length"
      :datas="commentListDatas"
      @is-comment="isComment"
    ></comment-list>
    <comment-empty v-else></comment-empty>
  </div>
  <my-dialog
    v-model="showDialog"
    :maskable="false"
    :title="status === 0 ? title : `回复@${commentAttrs.repliedName}`"
    :dividerable="true"
    :show-icon="false"
    :draggable="true"
    :close="!loading"
    :mask-closable="false"
    @move-focus="moveFocus"
  >
    <div class="comment-dialog__box">
      <n-input
        id="commentInput"
        ref="textareaRef"
        type="textarea"
        v-model:value="commentContent"
        :placeholder="placeMess"
        size="small"
        :autosize="{
          minRows: 6,
          maxRows: 6,
        }"
        :disabled="loading"
        :maxlength="140"
        @keypress.enter.prevent="submitComment"
        @blur="handleToColor('rgba(194, 194, 194, 1)')"
        @focus="handleToColor('rgb(51, 54, 57)')"
      />
      <div class="comment-dialog__content--length">
        <span>{{ commentContent.length }}/140</span>
      </div>
      <div class="comment-dialog__content--expression">
        <emotions
          v-model="commentContent"
          :emotions-datas="emotionsDatas"
          :comment-inp-ele="commentInpEle"
        ></emotions>
      </div>
      <div class="comment-dialog__spa"></div>
      <div class="comment-dialog__submit">
        <n-button
          :disabled="commentContent.length === 0"
          :loading="loading"
          color="#ff6700"
          @click="submitComment"
          >{{ loading ? `${buttonMess}中` : `${buttonMess}` }}</n-button
        >
      </div>
    </div>
  </my-dialog>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
  customRef,
  computed,
  reactive,
  provide,
  inject,
  onBeforeUnmount,
} from "@vue/runtime-core";
import myDialog from "@/components/ui-components/myDialog.vue";
import commentList from "./commentList.vue";
import emotions from "./emotions.vue";
import emotionsDatas from "@/staticDatas/emotions";
import type { NInput } from "naive-ui";
import type { Ref } from "@vue/runtime-core";
import commentEmpty from "./commentEmpty.vue";

export default defineComponent({
  name: "comment",
  components: {
    myDialog,
    emotions,
  },
  props: {
    // 商品名称
    title: {
      type: String,
      required: true,
    },
  },
  computed: {
    // 评论列表数据
    // eslint-disable-next-line no-undef
    commentListDatas(): Array<Comments> {
      return this.$store.state.CommentModule.commentList;
    },
  },
  methods: {
    // 移动对话框后文本域聚焦
    moveFocus(): void {
      (this.$refs.textareaRef as InstanceType<typeof NInput>).focus();
    },
    // 改变文本域的字体颜色
    handleToColor(color: string): void {
      (
        document.getElementsByClassName(
          "n-input__textarea-el"
        )[0] as HTMLAreaElement
      ).style.color = color;
    },
  },
});
</script>

<script lang="ts" setup>
import { useMessage } from "naive-ui";
import { useStore } from "@/store/index";
import { useState } from "@/vuexHooks";
import { Base64 } from "js-base64";

/**
 * 商品的唯一Id值
 */
const id: Ref<number> = inject("id") as Ref<number>;
const store = useStore();
const $message = useMessage();
const { isLogin, avatarSrc, userName, account } = useState(
  ["isLogin", "avatarSrc", "userName", "account"],
  "UserModule"
);
/**
 * 是否显示对话框
 */
let showDialog = ref<boolean>(false);

/**
 * 创建自定义响应属性
 * @param value - 属性值
 */
const useRef: (value: string) => Ref<string> = (value: string): Ref<string> =>
  customRef((track, trigger) => ({
    get(): string {
      track();
      return value;
    },
    set(newValue: string): void {
      value = newValue.trim();
      trigger();
    },
  }));
/**
 * 评论内容
 */
let commentContent: Ref<string> = useRef("");
/**
 * 给文本域输入框一个ref属性
 */
let textareaRef = ref<InstanceType<typeof NInput>>();
/**
 * 是否显示发表评论动画
 */
let loading = ref<boolean>(false);
/**
 * 评论输入框元素
 */
let commentInpEle: Ref<HTMLTextAreaElement> =
  ref<HTMLTextAreaElement>() as Ref<HTMLTextAreaElement>;

watch(
  (): boolean => showDialog.value,
  (value: boolean): void => {
    // 如果对话框打开时则文本域输入框自动聚焦
    if (value)
      setTimeout(() => {
        textareaRef.value?.focus();
        // 评论输入框元素
        commentInpEle.value = document
          .getElementById("commentInput")
          ?.querySelector(".n-input__textarea-el") as HTMLTextAreaElement;
      }, 400);
    else commentContent.value = "";
  }
);

/**
 * 当前对话框是评论还是回复(0的话代表评论)
 */
let status = ref<number>(0);
/**
 * 对话框的按钮文字
 */
let buttonMess = computed(() => (status.value === 0 ? "评论" : "回复"));
/**
 * 对话框中的文本域占位符信息
 */
let placeMess = computed(() =>
  status.value === 0 ? "请输入评论内容" : `回复@${commentAttrs.repliedName}：`
);
/**
 * 是否打开评论对话框
 * @param open - 是否打开
 */
const $_openDialog: (open: boolean) => void = (open: boolean): void => {
  showDialog.value = open;
};

let commentAttrs = reactive<{
  type: number; // 如果用户回复的话是回复评论还是回复评论的评论(0代表回复评论)
  fatherCommentId: number; // 被回复评论的所属一级评论的id值
  commentId: number; // 被回复评论的id值
  repliedName: string; // 被回复人的用户名
}>({
  type: 0,
  fatherCommentId: -1,
  commentId: -1,
  repliedName: "",
});
/**
 * 用户准备评论还是回复评论
 * @param type - 代表用户准备评论(0代表评论)
 * @param genres - 用户是回复评论还是回复评论的评论
 * @param name - 被回复评论的用户名字
 * @param id - 被回复评论的一级评论的id值
 */
const isComment: (
  type: number,
  genres?: number,
  name?: string,
  fatherId?: number,
  id?: number
) => void = (
  type: number,
  genres?: number,
  name?: string,
  fatherId?: number,
  id?: number
): void => {
  if (typeof name === "string") commentAttrs.repliedName = name;
  if (typeof genres === "number") commentAttrs.type = genres;
  if (typeof fatherId === "number")
    commentAttrs.fatherCommentId = fatherId as number;
  if (typeof id === "number") commentAttrs.commentId = id as number;
  status.value = type; // 改变状态码
  $_openDialog(true); // 打开对话框
};

/**
 * 开始提交评论
 */
const submitComment: () => void = (): void => {
  // 如果用户未登录则不打开
  if (!isLogin.value) {
    $message.error("请先登录");
    return;
  }
  if (loading.value) return; // 如果正在加载动画则不执行以下动作
  if (commentContent.value.length === 0) {
    $message.error("评论内容不能为空");
  } else {
    loading.value = true;
    switch (status.value) {
      case 0: {
        store
          .dispatch("CommentModule/addComment", {
            staticData: {
              avatar: avatarSrc.value,
              userName: userName.value,
            },
            sendData: {
              productId: id.value,
              account: Base64.encode(account.value),
              time: new Date().getTime(),
              comment: commentContent.value,
            },
          })
          .then((res: boolean): void => {
            if (res) {
              showDialog.value = false; // 关闭对话框
              $message.success("评论成功");
            } else {
              $message.error("评论失败");
            }
            loading.value = false; // 关闭动画
          })
          .catch(() => {
            loading.value = false; // 关闭动画
            $message.error("评论失败");
          });
        break;
      }
      case 1: {
        store
          .dispatch("CommentModule/addReplayComment", {
            staticData: {
              avatar: avatarSrc.value,
              userName: userName.value,
              fatherCommentId: commentAttrs.fatherCommentId,
            },
            sendData: {
              productId: id.value,
              commentId: commentAttrs.commentId,
              account: Base64.encode(account.value),
              time: new Date().getTime(),
              comment: commentContent.value,
            },
          })
          .then((res: boolean): void => {
            if (res) {
              showDialog.value = false; // 关闭对话框
              $message.success("回复成功");
            } else {
              $message.error("回复失败");
            }
            loading.value = false; // 关闭动画
          })
          .catch(() => {
            loading.value = false; // 关闭动画
            $message.error("回复失败");
          });
        break;
      }
    }
  }
};

let timing = ref<number>(0);
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
) => void = ((): ((
  account: string,
  commentId: number,
  fatherCommentId: number
) => void) => {
  let temp: boolean = false;
  return (
    account: string,
    commentId: number,
    fatherCommentId: number
  ): void => {
    if (temp) return;
    temp = true;
    store
      .dispatch("CommentModule/handleToThumb", {
        sendData: {
          account,
          commentId,
          fatherCommentId,
        },
      })
      .then((res: boolean) => {
        if (!res) $message.error("点赞失败");
        timing.value = setTimeout(() => (temp = false), 200);
      })
      .catch(() => {
        $message.error("点赞失败");
        timing.value = setTimeout(() => (temp = false), 200);
      });
  };
})();
provide("handleToThumb", handleToThumb);

onBeforeUnmount(() => {
  if (timing.value) clearTimeout(timing.value);
});
</script>

<style lang="less" scoped>
.icon-smile,
:deep(.icon-smile) {
  font-size: 18px;
  cursor: pointer;
}
.comment {
  width: 60%;
  margin-top: 30px;

  &-title {
    color: extract(@colors, 3);
  }

  &-spa {
    .setWidHei(100%, 1px);
    background-image: linear-gradient(
      to right,
      rgba(255, 0, 0, 0),
      #cec9c9,
      rgba(255, 0, 0, 0)
    );
    margin: 10px 0 30px;
  }

  &-input--disabled {
    :deep(.n-input__input-el) {
      cursor: text;
    }

    height: 30px;
    outline: 8px solid #e6e4e4a2;
    border-radius: 0;
    cursor: text !important;
  }

  &-dialog {
    &__box {
      width: 85%;
      margin-left: 30px;

      .n-input {
        margin: 20px 0 15px;
      }
    }

    &__content {
      &--expression {
        color: rgba(194, 194, 194, 1);
        margin-top: -20px;
      }

      &--length {
        text-align: right;
        box-sizing: border-box;
        font-size: 10px;
        color: rgba(194, 194, 194, 1);
        .noselect();
      }
    }

    &__spa {
      margin: 15px 0 20px;
      height: 0.5px;
      background-color: rgba(194, 194, 194, 1);
    }

    &__submit {
      text-align: right;
    }
  }
}
</style>