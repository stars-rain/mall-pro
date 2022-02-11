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
          [`six-replayComment-${commentId}`]:
            datasLen > 5 && $attrs.class === 'replay-comments' && index === 5,
        }"
        @contextmenu.stop="openMenu(item.type, item.id, item.userName, $event)"
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
        <comment-item
          :comment="item"
          :comment-id="item.id"
          :father-comment-id="commentId"
          @replay="replay"
        ></comment-item>
        <div v-if="item.loading" class="replay-comments__loading">
          <spin />
        </div>
        <template v-if="item.replay?.length && !item.loading">
          <list-comment
            :comment-id="item.id"
            class="replay-comments"
            v-if="item.showReplay"
            :datas="item.replay"
            @is-comment="isComment"
          ></list-comment
        ></template>
      </li>
      <template v-if="$attrs.class === 'replay-comments'">
        <transition name="hdieComments-fade">
          <li
            class="hide-replay--comments"
            v-show="showHideButton"
            @click="hideReplayComment(commentId)"
            @contextmenu.stop
          >
            收起评论
            <svg-icon icon-class="arrowUp"></svg-icon></li></transition
      ></template>
    </ul>
    <comment-menu
      ref="commentMenuRef"
      v-model="showMenu"
      :is-self="isSelf"
      :comment="currentCommentData"
      :father-comment-id="commentId"
      :replay-attrs="replayAttrs"
      @replay="replay"
    ></comment-menu>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  defineEmits,
  computed,
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
  withDefaults,
  defineProps,
} from "@vue/runtime-core";
import commentMenu from "./menu.vue";
import commentItem from "./commentItem.vue";

export default defineComponent({
  name: "list-comment",
  components: { commentMenu, commentItem },
});
</script>

<script lang="ts" setup>
import { useStore } from "@/store/index";

const store = useStore();
const props = withDefaults(
  defineProps<{
    // eslint-disable-next-line no-undef
    datas: Array<Comments>; // 评论数据
    commentId?: number; // 商品评论的索引值(一般用来记录二级评论的父级评论的索引值)
  }>(),
  {
    commentId: -1,
  }
);
let datasLen = computed(() => props.datas.length);
const emits = defineEmits<{
  (
    e: "isComment",
    type: number,
    genre?: number,
    name?: string,
    fatherId?: number,
    id?: number
  ): void; // 告知父组件用户准备回复评论
}>();
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
 * 给listX对象的各属性值重新求值
 */
const getListX: () => void = (): void => {
  const rect = commentList.value?.getBoundingClientRect();
  listX.top =
    (rect?.y as number) + document.documentElement.scrollTop ||
    document.body.scrollTop;
  // 获取该组件根元素距离浏览器顶部和左边界的距离
  listX.left = rect?.x as number;
  listX.width = rect?.width as number;
};
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
    // eslint-disable-next-line no-undef
    globalThis.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;
};

/**
 * 是否显示收起评论按钮
 */
let showHideButton = ref<boolean>(false);
/**
 * 隐藏回复评论
 * @param id - 对应评论的id值
 */
const hideReplayComment: (id: number) => void = (id: number): void => {
  // eslint-disable-next-line no-undef
  const commentList: Array<Comments> = store.state.CommentModule.commentList;
  commentList[commentList.findIndex((item) => item.id === id)].showReplay =
    false;
};
/**
 * 观察回复评论的第六条评论(主要作用是用来显示还是关闭收起评论按钮)
 */
const observeReplayComment: () => void = (): void => {
  const ele: HTMLLIElement = document.getElementsByClassName(
    `six-replayComment-${props.commentId}`
  )[0] as HTMLLIElement;
  if (!ele) return;
  const rect = ele.getBoundingClientRect();
  if (rect.y <= winHei.value && !showHideButton.value)
    // 如果元素距离浏览器顶部的距离小于或者等于窗口的高度则显示收起评论按钮
    showHideButton.value = true;
  else if (rect.y > winHei.value && showHideButton.value)
    showHideButton.value = false;
};

onMounted(() => {
  getListX();
  getWinHei();
  window.addEventListener("resize", getWinHei);
  document.addEventListener("scroll", observeReplayComment);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", getWinHei);
  document.removeEventListener("scroll", observeReplayComment);
});

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
  commentId: number;
}>({
  type: 0, // 是回复评论还是回复评论的评论(0代表回复评论)
  replaiedName: "", // 被回复的用户名
  commentId: 0, // 被回复的评论的id值
});

/**
 * 当前用户操作的某条评论的具体数据
 */
let currentCommentData = computed(
  () =>
    props.datas[
      props.datas.findIndex((item) => item.id === replayAttrs.commentId)
    ]
);

/**
 * 打开评论操作菜单
 * @param type - 是回复评论还是回复评论的评论(0代表回复评论)
 * @param index - 该条评论的索引值值
 * @param name - 该登录用户的用户名
 */
const openMenu: (
  type: number,
  index: number,
  name: string,
  e: MouseEvent
) => void = (type: number, id: number, name: string, e: MouseEvent): void => {
  e.preventDefault();
  replayAttrs.type = type;
  replayAttrs.commentId = id;
  replayAttrs.replaiedName = name; // 发表该条评论的用户名
  if (name === userName.value) isSelf.value = true;
  else isSelf.value = false;
  if (!showMenu.value) showMenu.value = true; //打开评论操作菜单
  getListX();
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
    // 评论操作菜单的宽度
    const menuWid: number = (
      commentMenuRef.value?.$refs.commentMenu as HTMLDListElement
    ).offsetWidth;
    // 边界处理
    if (winHei.value - yTop < menuHei)
      y =
        scrollY + yTop - listX.top > 0
          ? scrollY + yTop - listX.top - menuHei
          : 0;
    else y = scrollY + yTop - listX.top > 0 ? scrollY + yTop - listX.top : 0;
    if (listX.width + listX.left - xLeft < menuWid)
      x = xLeft - listX.left > 0 ? xLeft - listX.left - menuWid : 0;
    else x = xLeft - listX.left > 0 ? xLeft - listX.left : 0;
    commentMenuRef.value?.handlerToDirection(x, y); // 改变评论操作菜单的位置
  });
};

/**
 * @type - 是回复还是单纯的评论(1代表回复)
 * @genre - 是回复评论还是回复评论的评论
 * @param name - 被回复人的姓名
 * @param id - 被回复评论的一级评论的id值
 */
const isComment: (
  type: number,
  genre?: number,
  name?: string,
  fatherId?: number,
  id?: number
) => void = (
  type: number,
  genre?: number,
  name?: string,
  fatherId?: number,
  id?: number
): void => {
  emits("isComment", type, genre as number, name, fatherId, id); // 告知父组件用户准备回复评论
};
/**
 * 回复评论
 * @param type - 是回复还是单纯的评论(1代表回复)
 * @param genre - 是回复评论还是回复评论的评论
 * @param name - 被回复人的姓名
 * @param id - 被回复评论的一级评论的id值
 */
const replay: (
  type: number,
  genre: number,
  name: string,
  fatherId: number,
  id: number
) => void = (
  type: number,
  genre: number,
  name: string,
  fatherId: number,
  id: number
): void => {
  isComment(type, genre, name, fatherId, id);
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
}
.replay {
  &-comments {
    margin: 60px 30px 0 60px;
    background-color: #fafafa;
    border-left: 2px solid #f6f6f6;

    &__loading {
      text-align: center;
      margin: 60px 30px 0 60px;
      padding: 20px;
    }
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
}
.hide-replay--comments {
  position: sticky;
  bottom: 0;
  text-align: center;
  background-color: rgba(241, 240, 240, 0.95);
  color: #c7c6c6;
  padding: 6px;
  cursor: pointer;

  &:hover {
    color: #bebdbd;
  }
}
.hdieComments-fade {
  .fade(0.3s, ease-in);
}
</style>