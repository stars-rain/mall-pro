<template>
  <div class="comment-attr">
    <span
      :class="{
        'comment-attr--name': true,
        'comment-name': comment.type === 0,
        'replay-name': comment.type === 1,
      }"
      ><span>{{ comment.userName }}</span>
      <span v-if="comment.replaiedName" class="replay-replay--comment"
        >回复@{{ comment.replaiedName }}</span
      >：</span
    >
    <span
      :class="{
        'comment-attr--content': true,
        'comment-content': comment.type === 0,
        'replay-content': comment.type === 1,
      }"
      v-filterComment="comment.comment"
    ></span>
    <div class="clearfix comment-attr--box">
      <div class="comment-attr--left">
        <span class="left-time" v-time="comment.time"></span>
        <span
          class="left-replay"
          @click="showReplayComments(comment, commentId)"
          v-if="comment.replayCount"
          >评论 ({{ comment.replayCount > 99 ? "99+" : comment.replayCount }})
        </span>
      </div>
      <div class="comment-attr--right">
        <span
          class="attr-thumb"
          @click="$_handleToThumb(commentId, fatherCommentId)"
        >
          <svg-icon
            :class="{
              'icon-like': true,
              'like-color': comment.isLiked,
              'hate-color': !comment.isLiked,
            }"
            icon-class="like"
          ></svg-icon>
          <span v-if="comment.thumb">({{ comment.thumb }})</span>
        </span>
        <span class="right-spa">|</span>
        <span
          class="right-repDele"
          @click="replay(comment.type, comment.userName)"
          >回复</span
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  withDefaults,
  defineProps,
  defineEmits,
  inject,
} from "@vue/runtime-core";
import filterComment from "@/directives/filterComment";
import time from "@/directives/time";

export default defineComponent({
  name: "comment-item",
  computed: {
    userName(): string {
      return this.$store.state.UserModule.userName;
    },
  },
  directives: {
    time,
    filterComment,
  },
});
</script>

<script lang="ts" setup>
import { useStore } from "@/store/index";
import { Base64 } from "js-base64";
import { useMessage } from "naive-ui";

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
const store = useStore();
const $message = useMessage();

const props = withDefaults(
  defineProps<{
    commentId: number; // 单纯的评论的id值(不包括回复评论的评论)
    fatherCommentId?: number; // 一级评论的id值
    // eslint-disable-next-line no-undef
    comment: Comments; // 评论的具体属性内容
  }>(),
  {
    fatherCommentId: -1,
  }
);
const emits = defineEmits<{
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
 * @param commentId - 评论的id值
 * @param fatherCommentId - 一级评论的id值
 */
const $_handleToThumb: (commentId: number, fatherCommentId: number) => void = (
  commentId: number,
  fatherCommentId: number
): void => {
  if (!store.state.UserModule.isLogin) $message.error("请先登录");
  else
    handleToThumb(
      Base64.encode(store.state.UserModule.account),
      commentId,
      fatherCommentId
    );
};
/**
 * 是否需要显示评论的回复评论
 * @param item - 商品的某条评论
 * @param id - 该条评论的id值
 */
// eslint-disable-next-line no-undef
const showReplayComments: (item: Comments, id: number) => void = (
  // eslint-disable-next-line no-undef
  item: Comments,
  id: number
): void => {
  if (item.loading) return;
  if (item.showReplay) item.showReplay = false;
  else {
    // 如果该一级评论有二级评论的话则向后端请求二级评论数据
    if (!item.replay.length || item.replayStatus === 1) {
      item.loading = true;
      store
        .dispatch("CommentModule/getReplayComment", {
          id,
          account: Base64.encode(store.state.UserModule.account),
        })
        .then((res: boolean): void => {
          if (res)
            setTimeout(() => {
              item.loading = false;
              item.showReplay = true;
              item.replayStatus = 0; // 恢复此条评论下的二级评论的状态值, 此时没发生改变
            }, 400);
          else {
            item.loading = false;
            $message.error("获取失败");
          }
        })
        .catch(() => {
          item.loading = false;
          $message.error("获取失败");
        });
    } else item.showReplay = true;
  }
};

/**
 * 回复一级评论
 * @param type - 回复的是一级评论还是二级评论(0代表一级评论)
 * @param userName - 当前登录用户的用户名
 */
const replay: (type: number, userName: string) => void = (
  type: number,
  userName: string
): void => {
  if (!userName) $message.error("请先登录");
  else
    emits("replay", 1, type, userName, props.fatherCommentId, props.commentId);
};
</script>

<style lang="less" scoped>
@opearColor: #c7c6c6;

.hover() {
  &:hover {
    color: #a09d9d;
  }
}
.hate-color {
  .hover();
}
.like-color {
  margin-right: 3px;
  color: extract(@colors, 3);
}
.comment {
  &-attr {
    float: left;
    margin-left: 12px;
    width: calc(100% - 70px);

    &--box {
      margin-top: 5px;
    }

    &--name {
      cursor: pointer;
    }

    &--content {
      word-wrap: break-word;
    }

    .attrs(@dir) {
      float: @dir;
      color: @opearColor;
      font-size: 13px;
    }

    &--left {
      .attrs(left);

      .left {
        &-time {
          margin-right: 10px;
        }

        &-replay {
          cursor: pointer;
          .hover();
        }
      }
    }

    &--right {
      .attrs(right);

      .attr-thumb {
        cursor: pointer;
      }
      .icon-like {
        transition: color 0.2s;
        font-size: 16px;
      }
      .right {
        &-spa {
          margin: 0 12px;
          vertical-align: 1px;
        }

        &-repDele {
          cursor: pointer;
          .hover();
        }
      }
    }
  }
}
.nameContent(@size, @number) {
  font-size: @size;
  color: extract(@colors, @number);
}
.comment {
  &-name {
    .nameContent(14px, 3);
  }
  &-content {
    .nameContent(14px, 1);
  }
}
.replay {
  &-name {
    .nameContent(13px, 3);
  }

  &-content {
    .nameContent(13px, 1);
  }

  &-replay--comment {
    color: #1485f7;
    margin-left: 8px;
    font-size: 14px;
  }
}
</style>