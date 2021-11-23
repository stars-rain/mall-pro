<template>
  <div ref="commentList" style="position: relative">
    <ul class="comment-list">
      <li
        v-for="(item, index) in datas"
        :key="item.time"
        :class="{
          clearfix: true,
          'comment-item--nolast': index !== datasLen - 1,
        }"
        @contextmenu="openMenu(item.userName, index, item.userName, $event)"
      >
        <div class="comment-avatar">
          <img :src="item.avatar" alt="无法显示此图片" />
        </div>
        <div class="comment-attr">
          <span class="comment-attr--name">{{ item.userName }}：</span>
          <span
            class="comment-attr--content"
            v-filterComment="item.comment"
          ></span>
          <div class="clearfix" style="margin-top: 4px">
            <div class="comment-attr--time" v-time="item.time"></div>
            <div class="comment-attr--right">
              <svg-icon popper-class="icon-like" icon-class="like"></svg-icon>
              <span class="right-spa">|</span>
              <span
                class="right-repDele"
                @click="replay(item.userName, index)"
                >回复</span
              >
            </div>
          </div>
        </div>
      </li>
    </ul>
    <comment-menu
      ref="commentMenuRef"
      v-model="showMenu"
      :is-self="isSelf"
      :comment-index="commentIndex"
      :comment-name="commentName"
      @replay="replay"
    ></comment-menu>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  inject,
  defineEmits,
  computed,
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "@vue/runtime-core";
import time from "@/directives/time";
import filterComment from "@/directives/filterComment";
import commentMenu from "./menu.vue";

export default defineComponent({
  name: "comment-list",
  components: { commentMenu },
  props: {
    // 评论数据
    datas: {
      // eslint-disable-next-line no-undef
      type: Array as PropType<Array<Comments>>,
      required: true,
    },
  },
  computed: {
    datasLen(): number {
      return this.datas.length;
    },
  },
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
const emits = defineEmits<{
  (e: "isComment", type: number, name?: string, index?: number): void; // 告知父组件用户准备回复评论
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
  // 获取该组件根元素距离浏览器顶部和左边界的距离
  listX.top = commentList.value?.offsetTop as number;
  listX.left = commentList.value?.offsetLeft as number;
  listX.width = commentList.value?.offsetWidth as number;
  getWinHei();
  window.addEventListener("resize", getWinHei);
});
onBeforeUnmount(() => window.removeEventListener("resize", getWinHei));

/**
 * 给评论操作菜单一个ref属性
 */
let commentMenuRef = ref<InstanceType<typeof commentMenu>>();
/**
 * 回复该条评论的index索引值
 */
let commentIndex = ref<number>(0);
/**
 * 回复该条评论的发表者
 */
let commentName = ref<string>("");
/**
 * 打开评论操作菜单
 * @param username - 该登录用户的用户名
 * @param id - 该条评论的id值
 */
const openMenu: (
  username: string,
  id: number,
  name: string,
  e: MouseEvent
) => void = (
  username: string,
  id: number,
  name: string,
  e: MouseEvent
): void => {
  e.preventDefault();
  commentIndex.value = id; // 该条评论的id值
  commentName.value = name; // 发表该条评论的用户名
  if (username === userName.value) isSelf.value = true;
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
      y = scrollY + yTop - listX.top > 0 ? scrollY + yTop - listX.top - menuHei : 0;
    else y = scrollY + yTop - listX.top > 0 ? scrollY + yTop - listX.top : 0;

    if (listX.width + listX.left - xLeft < 136)
      x = xLeft - listX.left > 0 ? xLeft - listX.left - 136 : 0;
    else x = xLeft - listX.left > 0 ? xLeft - listX.left : 0;
    commentMenuRef.value?.handlerToDirection(x, y); // 改变评论操作菜单的位置
  });
};

/**
 * 回复评论
 * @param name - 被回复人的姓名
 * @param id - 被回复评论的id值
 */
const replay: (name: string, index: number) => void = (
  name: string,
  index: number
): void => {
  emits("isComment", 1, name, index);
};
</script>

<style lang="less" scoped>
@opearColor: #c7c6c6;
.comment {
  &-item--nolast {
    border-bottom: 1px solid #f6f6f6;
  }
  &-list {
    background-color: extract(@colors, 4);
    margin-top: 30px;
    box-shadow: 0 1px 2px -2px rgb(0 0 0 / 8%), 0 3px 6px 0 rgb(0 0 0 / 6%),
      0 5px 12px 4px rgb(0 0 0 / 4%);

    li {
      display: block;
      padding: 15px;
    }
  }

  &-avatar {
    .setWidHei(40px, 40px);
    float: left;
    border-radius: 50%;
    border: 1px solid extract(@colors, 5);

    img {
      .setWidHei(100%, 100%);
      object-fit: cover;
    }
  }

  &-attr {
    float: left;
    margin-left: 15px;
    width: calc(100% - 70px);

    .nameContent(@number) {
      font-size: 14px;
      color: extract(@colors, @number);
    }

    &--name {
      cursor: pointer;
      .nameContent(3);
    }

    &--content {
      .nameContent(1);
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

    &--time {
      .attrs(left);
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
</style>