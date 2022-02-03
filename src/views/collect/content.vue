<template>
  <div v-if="collectObj.datasLen">
    <delete-box
      title="件商品"
      :datas="collectObj.datas"
      v-model:show-prompt="showPrompt"
      v-model:select-ids="currSelectIds"
      v-model:show-sele-all="showSeleAll"
      @cancel-checked="cancelChecked"
      @open-dailog-dele="openDailogDele"
    ></delete-box>
    <div class="collect">
      <div class="container">
        <transition name="fade">
          <div class="collect-loading flex" v-if="loading || isLoadingError">
            <div class="collect-error" v-if="isLoadingError">
              <div class="collect-error__icon">
                <svg-icon icon-class="close"></svg-icon>
              </div>
              <span>获取失败</span>
              <span class="loading-again" @click="requestCollectDatas(page)"
                >重新加载</span
              >
            </div>
            <n-spin v-else stroke="#ff6700" size="large"></n-spin>
            <div class="loading-text" v-if="isLoadingDelete">正在移除...</div>
            <div class="loading-text" v-else-if="!isLoadingError">
              正在加载...
            </div>
          </div></transition
        >
        <ul>
          <li
            :class="{
              imgHover: !currSelectIds.includes(item.id),
              'float-up': currSelectIds.includes(item.id),
            }"
            v-for="item in collectObj.datas"
            :key="item.id"
          >
            <router-link
              class="collect-link flex"
              :to="{
                name: 'detailsPage',
                params: { title: item.title },
                query: { id: item.productId },
              }"
              @mouseenter="hoverId = item.id"
              @mouseleave="hoverId = 0"
            >
              <transition name="fade">
                <svg-icon
                  v-show="
                    item.id === hoverId && !currSelectIds.includes(item.id)
                  "
                  popper-class="icon-delete--collect"
                  icon-class="remove"
                  @click.prevent="
                    openDailogDele('确认移除该件商品？', item.id)
                  "
                ></svg-icon
              ></transition>
              <div
                :class="{
                  'check-collect': true,
                  flex: true,
                  isChecked: currSelectIds.includes(item.id),
                  noChecked: !currSelectIds.includes(item.id),
                }"
                @click.prevent="checkToItem(item.id)"
              >
                <svg-icon
                  popper-class="icon-checked"
                  v-show="currSelectIds.includes(item.id)"
                  icon-class="check"
                ></svg-icon>
              </div>
              <img
                class="collect-img lazy"
                :src="item.imgSrc"
                alt="无法加载此图片"
              />
              <div style="margin-left: 10px">
                <h3 class="collect-name">{{ item.name }}</h3>
                <p class="collect-desc">{{ item.description }}</p>
                <p class="collect-price">
                  {{ item.curPrice }}<del>{{ item.oriPrice }}</del>
                </p>
                <button
                  class="add-cart"
                  @click.prevent="addCart(item.productId)"
                >
                  加入购物车
                </button>
              </div>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
    <my-dialog v-model="showDialog">
      <div class="dialog-prompt">
        <svg-icon popper-class="icon-warn" icon-class="warn"></svg-icon>
        {{ prompt }}
      </div>
      <template #footer>
        <n-button @click="showDialog = false" size="medium" color="#cac8c8"
          >取消</n-button
        >
        <n-button color="#ff6700" size="medium" @click="deleteCollectDatas"
          >确认</n-button
        >
      </template>
    </my-dialog>
  </div>
  <collect-empty
    title="暂无收藏数据，现在去"
    icon-class="collectEmpty"
    v-else
  ></collect-empty>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  withDefaults,
  defineProps,
  ref,
  computed,
  watch,
} from "@vue/runtime-core";

export default defineComponent({
  name: "my-collect",
  data() {
    return {
      hoverId: 0, // 鼠标当前悬停在某件商品时，该值为该件商品的id值
    };
  },
});
</script>

<script lang="ts" setup>
import { useStore } from "@/store/index";
import myDialog from "@/components/ui-components/myDialog.vue";
import collectEmpty from "../empty.vue";
import deleteBox from "./deleteBox.vue";
import { useMessage } from "naive-ui";
import { Base64 } from "js-base64";
import { onBeforeRouteUpdate } from "vue-router";
import { useActions } from "@/vuexHooks";
import router from "@/router";

const props = withDefaults(
  defineProps<{
    page?: string;
  }>(),
  {
    page: "1",
  }
);
const { getCollect, deleteCollect } = useActions(
  ["getCollect", "deleteCollect"],
  "CollectModule"
);
let page = ref<number>(+props.page);

watch(
  (): string => props.page,
  (newValue: string): void => {
    page.value = +newValue;
  }
);

const store = useStore();
const $message = useMessage();

/**
 * 该登录用户的所有收藏商品
 */
const collectObj = computed(() => ({
  datas: store.state.CollectModule.collectDatas,
  datasLen: store.state.CollectModule.collectLen,
}));

/**
 * 加入购物车
 * @param id - 商品的唯一id值
 */
const addCart: (id: number) => void = (function (): (id: number) => void {
  // 节流
  let debounce: boolean = false;
  return (id: number): void => {
    if (debounce) return;
    debounce = true;
    // 向后台发送数据
    store
      .dispatch("CartModule/sendCartDatas", {
        account: Base64.encode(store.state.UserModule.account),
        id,
      })
      .then((value: boolean): void => {
        if (value) {
          $message.success("成功加入购物车");
          if (store.state.CartModule.status !== 1)
            store.commit("CartModule/handleToStatus", { status: 1 }); // 用户成功修改了购物车状态
        } else $message.error("加入购物车失败");
        setTimeout(() => {
          debounce = false;
        }, 300);
      })
      .catch(() =>
        setTimeout(() => {
          debounce = false;
          $message.error("加入购物车失败");
        }, 300)
      );
  };
})();

/**
 * 是否开始加载动画
 */
let loading = ref<boolean>(false);
/**
 * 获取数据是否出错
 */
let isLoadingError = ref<boolean>(false);

/**
 * 请求收藏数据
 * @param page - 请求的页码数
 */
const requestCollectDatas: (page: number) => void = (page: number): void => {
  loading.value = true; // 开始加载动画
  if (isLoadingError.value) isLoadingError.value = false;
  if (currSelectIds.length) currSelectIds.splice(0);
  if (showSeleAll.value) showSeleAll.value = false;
  if (showPrompt.value) showPrompt.value = false;
  getCollect({
    account: Base64.encode(store.state.UserModule.account),
    page,
  })
    .then((res: boolean): void => {
      if (!res) isLoadingError.value = true;
      else if (isLoadingError.value) isLoadingError.value = false;
      loading.value = false;
    })
    .catch(() => {
      isLoadingError.value = true;
      loading.value = false;
    });
};

onBeforeRouteUpdate((to) => {
  if (!isTurnBeforePage.value) requestCollectDatas(+to.query.page!);
});

/**
 * 当前所勾选商品的id集合
 */
let currSelectIds = reactive<Array<number>>([]);
/**
 * 是否选择全部商品
 */
let showSeleAll = ref<boolean>(false);
/**
 * 是否显示删除框按钮(当用户勾选了商品时会显示)
 */
let showPrompt = ref<boolean>(false);

/**
 * 勾选某件已收藏的商品
 * @param id - 该件商品的id值
 */
const checkToItem: (id: number) => void = (id: number): void => {
  // 如果id集合中已经包括了此id值的话就移除否则加入
  if (currSelectIds.includes(id)) {
    currSelectIds.splice(
      currSelectIds.findIndex((item) => item === id),
      1
    );
    if (showSeleAll.value) showSeleAll.value = false; // 如果此时全被选中则取消全选
    if (currSelectIds.length === 0 && showPrompt.value)
      showPrompt.value = false;
  } else {
    currSelectIds.push(id);
    if (!showPrompt.value) showPrompt.value = true;
    if (currSelectIds.length === collectObj.value.datas.length)
      showSeleAll.value = true;
  }
};

/**
 * 取消已勾选的商品
 */
const cancelChecked: () => void = (): void => {
  if (showSeleAll.value) showSeleAll.value = false;
  if (showPrompt.value) showPrompt.value = false;
  if (currSelectIds.length) currSelectIds.splice(0);
};

/**
 * 是否打开对话框
 */
let showDialog = ref<boolean>(false);
/**
 * 对话框的提示信息
 */
let prompt = ref<string>("");
/**
 * 当前用户需要移除的商品id
 */
let currentDeleId = ref<number>(0);

/**
 * 打开确认移除某件收藏商品的对话框
 * @param mess - 对话框的提示信息
 * @param id - 如果是单选删除某件商品时为该件商品的id值
 */
const openDailogDele: (mess: string, id?: number) => void = (
  mess: string,
  id?: number
): void => {
  showDialog.value = true;
  prompt.value = mess;
  if (id) currentDeleId.value = id;
};

/**
 * 删除数据是否出错
 */
let isLoadingDelete = ref<boolean>(false);
/**
 * 当用户是否删除了最后一页的全部数据后跳转到上一页
 */
let isTurnBeforePage = ref<boolean>(false);

/**
 * 发送请求删除数据
 * @param ids - 商品的id数据集合
 * @param isShowPrompt - 用户是通过删除按钮删还是直接删
 */
const deleteDatas: (ids: Array<number>, isShowPrompt: boolean) => void = (
  ids: Array<number>,
  isShowPrompt: boolean
): void => {
  showDialog.value = false; // 关闭对话框
  if (isShowPrompt) showPrompt.value = false; // 关闭删除框
  loading.value = true; // 开始加载动画
  isLoadingDelete.value = true;
  let currentPage: number = page.value;
  let temp: boolean = false;
  // 数据总数是否可以整除12
  const isZero: boolean = collectObj.value.datasLen % 12 === 0;
  const count: number = Math.trunc(collectObj.value.datasLen / 12);
  const maxPage: number = isZero ? count : count + 1; // 最大页码数
  if (
    ids.length === collectObj.value.datas.length &&
    page.value !== 1 &&
    page.value === maxPage
  ) {
    temp = true;
    currentPage = page.value - 1;
  }
  /**
   * 请求删除完后的操作
   */
  function callback(): void {
    loading.value = false; //停止加载动画
    isLoadingDelete.value = false;
  }
  deleteCollect({
    ids,
    page: currentPage,
  })
    .then((res: boolean) => {
      if (res) {
        if (temp) {
          isTurnBeforePage.value = true;
          router.push({
            path: "/collect/index",
            query: { page: currentPage },
          });
          store.commit("CollectModule/handleToNeedPage", { page });
        }
        $message.success("移除成功");
        if (isShowPrompt) cancelChecked();
        setTimeout(() => (isTurnBeforePage.value = false), 0);
      } else {
        $message.error("移除失败");
        if (isShowPrompt) showPrompt.value = true;
      }
      callback();
    })
    .catch(() => {
      $message.error("移除失败");
      if (isShowPrompt) showPrompt.value = true;
      callback();
    });
};
/**
 * 移除收藏数据
 */
const deleteCollectDatas: () => void = (): void => {
  switch (prompt.value) {
    case "确认移除该件商品？":
      deleteDatas([currentDeleId.value], false);
      break;
    case `确认移除该${currSelectIds.length}件商品？`:
      deleteDatas(currSelectIds, true);
      break;
  }
};
</script>

<style lang="less" scoped>
.float-up {
  transform: translate3d(0, -2px, 0);
  box-shadow: 0 15px 30px rgb(0 0 0 / 10%);
}
.iconPosi(@foneSize, @top) {
  position: absolute;
  font-size: @foneSize;
  top: @top;
}
.icon-delete--collect {
  .iconPosi(20px, 0);
  right: 5px;
  color: #b0b0b0;

  &:hover {
    color: extract(@colors, 3);
  }
}
.check-collect {
  .iconPosi(16px, 5px);
  .setWidHei(15px, 15px);
  left: 5px;
  border-radius: 50%;
  transition: background-color 0.25s;
}
.collect {
  position: relative;
  height: 500px;
  background-color: rgb(248, 249, 250);
  padding: 20px 0 10px 0;

  ul {
    margin-left: -16px;
    padding: 0 29px;

    li {
      margin: 0 0 16px 16px;
    }
  }

  &-img {
    .setWidHei(80px, 80px);
    object-fit: cover;
  }

  &-link {
    background-color: #fff;
    width: 280px;
    height: 150px;
    position: relative;
  }

  &-name {
    margin: 0;
    .aHover(14px, extract(@colors, 1));
  }

  &-desc {
    .aHover(12px, #b0b0b0);
    height: 16px;
    margin: 8px 0;
  }

  &-price {
    font-size: 14px;
    margin-top: 10px;
    text-align: center;
    color: extract(@colors, 3);

    del {
      color: #b0b0b0;
      margin-left: 8px;
    }
  }

  &-loading {
    .setWidHei(inherit, 576px);
    position: absolute;
    top: 20px;
    left: 0;
    color: extract(@colors, 3);
    font-size: 16px;
    flex-direction: column;
    z-index: 200;
    background-color: rgba(255, 255, 255, 0.8);
  }

  &-error {
    color: rgb(255, 0, 0);
    font-size: 20px;

    &__icon {
      .setWidHei(40px, 40px);
      line-height: 40px;
      display: inline-block;
      border-radius: 50%;
      margin-right: 20px;
      border: 2px solid rgb(255, 0, 0);
      font-size: 40px;
      vertical-align: middle;
    }
  }
}
.add-cart {
  margin-left: 10px;
  font-size: 12px;
  .setWidHei(80px, 30px);
  .submit(extract(@colors, 3), extract(@colors, 4),  #f58134);
}

.loading {
  &-again {
    margin-left: 10px;
    color: extract(@colors, 3);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &-text {
    margin-top: 10px;
  }
}
</style>