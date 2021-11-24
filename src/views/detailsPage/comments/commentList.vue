<template>
  <div
    ref="commentList"
    :class="{
      'comment-list': true,
      'is-comment': $attrs.class !== 'replay-comments',
    }"
  >
    <ul>
      <li
        v-for="(item, index) in datas"
        :key="item.time"
        :class="{
          clearfix: true,
          'comment-item--nolast': index !== datasLen - 1 && item.type === 0,
          'replay-item--nolast': index !== datasLen - 1 && item.type === 1,
          'comment-item': item.type === 0,
          'replay-item': item.type === 1,
        }"
        @contextmenu.stop="
          openMenu(item.type, index, item.userName, $event)
        "
      >
        <img
          :class="{
            'commentlist-avatar': true,
            'comment-avatar': item.type === 0,
            'replay-avatar': item.type === 1,
          }"
          :src="item.avatar"
          alt="无法显示此图片"
        />
        <div class="comment-attr">
          <span
            :class="{
              'comment-attr--name': true,
              'comment-name': item.type === 0,
              'replay-name': item.type === 1,
            }"
            ><span>{{ item.userName }}</span>
            <span v-if="item.replaiedName" class="replay-replay--comment"
              >回复@{{ item.replaiedName }}</span
            >：</span
          >
          <span
            :class="{
              'comment-attr--content': true,
              'comment-content': item.type === 0,
              'replay-content': item.type === 1,
            }"
            v-filterComment="item.comment"
          ></span>
          <div class="clearfix comment-attr--box">
            <div class="comment-attr--left">
              <span class="left-time" v-time="item.time"></span>
              <span
                class="left-replay"
                @click="item.showReplay = !item.showReplay"
                v-if="item.replay?.length"
                >评论 ({{
                  item.replay.length > 99 ? "99+" : item.replay.length
                }})
              </span>
            </div>
            <div class="comment-attr--right">
              <svg-icon popper-class="icon-like" icon-class="like"></svg-icon>
              <span class="right-spa">|</span>
              <span
                class="right-repDele"
                @click="
                  replay(
                    1,
                    item.type,
                    item.userName,
                    item.type === 1 ? commentIndex : index
                  )
                "
                >回复</span
              >
            </div>
          </div>
        </div>
        <template v-if="item.replay?.length">
          <list-comment
            :comment-index="index"
            class="replay-comments"
            v-if="item.showReplay"
            :datas="item.replay"
            @is-comment="isComment"
          ></list-comment
        ></template>
      </li>
    </ul>
    <comment-menu
      ref="commentMenuRef"
      v-model="showMenu"
      :is-self="isSelf"
      :comment-index="commentIndex"
      :replay-attrs="replayAttrs"
      @replay="replay"
    ></comment-menu>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,  
  inject,
  defineEmits,
  computed,
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
  useAttrs,
  withDefaults,
  defineProps,
} from "@vue/runtime-core";
import time from "@/directives/time";
import filterComment from "@/directives/filterComment";
import commentMenu from "./menu.vue";

export default defineComponent({
  name: "list-comment",
  components: { commentMenu },
  directives: {
    time,
    filterComment,
  },
});
</script>

<script lang="ts" setup>
import type { Ref } from "@vue/runtime-core";
import { useStore } from "@/store/index";

const store = useStore();
const $attrs = useAttrs();
const props = withDefaults(
  defineProps<{
    // eslint-disable-next-line no-undef
    datas: Array<Comments>; // 评论数据
    commentIndex?: number; // 商品评论的索引值(一般用来记录二级评论的父级评论的索引值)
  }>(),
  {
    commentIndex: 0,
  }
);
let datasLen = computed(() => props.datas.length);
const emits = defineEmits<{
  (
    e: "isComment",
    type: number,
    genre?: number,
    name?: string,
    index?: number
  ): void; // 告知父组件用户准备回复评论
}>();
/**
 * 当前商品的唯一id值
 */
let id: Ref<number> = inject("id") as Ref<number>;
/**
 * 当前登录账号的用户名
 */
let userName = computed(() => store.state.UserModule.userName);
/**
 * 是否打开评论操作菜单
 */
let showMenu = ref<boolean>(false);
/**
 * 用户是否正在操作自己的评论
 */
let isSelf = ref<boolean>(false);
/**
 * 该组件距离浏览器顶部、左边界以及自身宽度的距离对象
 */
let listX = reactive<{
  top: number;
  left: number;
  width: number;
}>({
  top: 0, // 该组件根元素距离浏览器顶部的距离
  left: 0, // 该组件根元素距离浏览器左边距的距离
  width: 0, // 该组件的宽度
});
/**
 * 给该组件根元素一个ref属性便于访问
 */
let commentList = ref<HTMLDivElement>();
/**
 * 浏览器的高度
 */
let winHei = ref<number>(0);
/**
 * 获取浏览器的高度
 */
const getWinHei: () => void = (): void => {
  winHei.value =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;
};

onMounted(() => {
  const rect = commentList.value?.getBoundingClientRect();
  listX.top =
    (rect?.y as number) + document.documentElement.scrollTop ||
    document.body.scrollTop;
  // 获取该组件根元素距离浏览器顶部和左边界的距离
  listX.left = rect?.x as number;
  listX.width = rect?.width as number;
  getWinHei();
  window.addEventListener("resize", getWinHei);
});
onBeforeUnmount(() => window.removeEventListener("resize", getWinHei));

/**
 * 给评论操作菜单一个ref属性
 */
let commentMenuRef = ref<InstanceType<typeof commentMenu>>();
/**
 * 回复属性(包括被回复的用户名、被回复的评论的索引值)
 */
let replayAttrs = reactive<{
  type: number;
  replaiedName: string;
  commentItemIndex: number;
}>({
  type: 0, // 是回复评论还是回复评论的评论(0代表回复评论)
  replaiedName: '', // 被回复的用户名
  commentItemIndex: 0, // 被回复的评论的索引值
});
/**
 * 打开评论操作菜单
 * @param type - 是回复评论还是回复评论的评论(0代表回复评论)
 * @param index - 该条评论的id值
 * @param name - 该登录用户的用户名
 */
const openMenu: (
  type: number,
  index: number,
  name: string,
  e: MouseEvent
) => void = (
  type: number,
  index: number,
  name: string,
  e: MouseEvent
): void => {
  e.preventDefault();
  replayAttrs.type = type;
  replayAttrs.commentItemIndex = index;
  replayAttrs.replaiedName = name; // 发表该条评论的用户名
  if (name === userName.value) isSelf.value = true;
  else isSelf.value = false;
  if (!showMenu.value) showMenu.value = true; //打开评论操作菜单
  const scrollY: number =
    document.documentElement.scrollTop || document.body.scrollTop; // 网页已滚动的距离
  const yTop = e.clientY; // 鼠标点击处距离浏览器顶部的距离
  const xLeft = e.clientX; // 鼠标点击处距离浏览器左边距的距离
  let x: number = 0, // 鼠标距离该绑定元素顶部的距离
    y: number = 0; // 鼠标距离该绑定元素左边距的距离
  nextTick(() => {
    // 评论操作菜单的高度
    const menuHei: number = (
      commentMenuRef.value?.$refs.commentMenu as HTMLDListElement
    ).offsetHeight;
    // 边界处理
    if (winHei.value - yTop < menuHei)
      y =
        scrollY + yTop - listX.top > 0
          ? scrollY + yTop - listX.top - menuHei
          : 0;
    else y = scrollY + yTop - listX.top > 0 ? scrollY + yTop - listX.top : 0;
    if (listX.width + listX.left - xLeft < 136)
      x = xLeft - listX.left > 0 ? xLeft - listX.left - 136 : 0;
    else x = xLeft - listX.left > 0 ? xLeft - listX.left : 0;
    commentMenuRef.value?.handlerToDirection(x, y); // 改变评论操作菜单的位置
  });
};

/**
 * @type - 是回复还是单纯的评论(1代表回复)
 * @genre - 是回复评论还是回复评论的评论
 * @param name - 被回复人的姓名
 * @param index - 被回复评论的索引值
 */
const isComment: (
  type: number,
  genre?: number,
  name?: string,
  index?: number
) => void = (
  type: number,
  genre?: number,
  name?: string,
  index?: number
): void => {
  emits("isComment", type, genre as number, name, index); // 告知父组件用户准备回复评论
};
/**
 * 回复评论
 * @param type - 是回复还是单纯的评论(1代表回复)
 * @param genre - 是回复评论还是回复评论的评论
 * @param name - 被回复人的姓名
 * @param index - 被回复评论的索引值
 */
const replay: (
  type: number,
  genre: number,
  name: string,
  index: number
) => void = (
  type: number,
  genre: number,
  name: string,
  index: number
): void => {
  isComment(type, genre, name, index);
};
</script>

<style lang="less" scoped>
.commentlist-avatar {
  float: left;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid extract(@colors, 5);
}
.is-comment {
  box-shadow: 0 1px 2px -2px rgb(0 0 0 / 8%), 0 3px 6px 0 rgb(0 0 0 / 6%),
    0 5px 12px 4px rgb(0 0 0 / 4%);
}
@opearColor: #c7c6c6;
.comment {
  &-item {
    padding: 15px;
  }
  &-item--nolast {
    border-bottom: 1px solid #f6f6f6;
  }
  &-list {
    background-color: extract(@colors, 4);
    margin-top: 30px;
    position: relative;

    li {
      display: block;
    }
  }

  &-avatar {
    .setWidHei(40px, 40px);
  }

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
    .hover() {
      transition: color 0.2s;
      &:hover {
        color: #a09d9d;
      }
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

      .icon-like {
        cursor: pointer;
        font-size: 16px;
        .hover();
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
.replay {
  &-comments {
    margin: 60px 30px 0 60px;
    background-color: #fafafa;
    border-left: 2px solid #f6f6f6;
  }

  &-item--nolast {
    border-bottom: 1px solid #eeebeb;
  }

  &-avatar {
    .setWidHei(35px, 35px);
  }

  &-item {
    padding: 12px;
  }

  &-replay--comment {
    color: #1485f7;
    margin-left: 8px;
    font-size: 14px;
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
}
</style>