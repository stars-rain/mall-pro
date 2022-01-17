<template>
  <div class="delete-box__container">
    <transition name="fade">
      <div v-show="showPrompt">
        <delete-box
          style="background-color: #fff"
          title="个订单"
          :datas="datas"
          v-model:show-prompt="showPrompt"
          v-model:select-ids="currSelectIds"
          v-model:show-sele-all="showSeleAll"
          @cancel-checked="cancelChecked"
          @open-dailog-dele="openDailogDele"
        ></delete-box>
        <transition name="fade">
          <div v-show="isShowShadow" class="drop-shadow"></div>
        </transition>
      </div>
    </transition>
  </div>
  <div class="order">
    <div class="container">
      <ul class="order-box">
        <li class="order-content clearfix" v-for="item in datas" :key="item.id">
          <div
            :class="{
              'check-order': true,
              'order-content__left': true,
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
          <ul class="order-content__right">
            <li class="order-content__header clearfix">
              <div class="order-id">订单编号：{{ item.orderId }}</div>
              <div class="order-date">订单日期：{{ item.time }}</div>
            </li>
            <li>
              <dl class="order-content__title clearfix">
                <dt></dt>
                <dt
                  :class="temp.className"
                  v-for="temp in headerDatas"
                  :key="temp.id"
                >
                  {{ temp.title }}
                </dt>
              </dl>
            </li>
            <li
              class="clearfix"
              v-for="commodity in item.commodities"
              :key="commodity.productId"
            >
              <div class="order-cols order-commodity__img">
                <img :src="commodity.imgSrc" alt="无法加载此图片" />
              </div>
              <div class="order-cols order-commodity__mess">
                <router-link
                  class="aColor"
                  :to="{
                    name: 'detailsPage',
                    params: { title: commodity.title },
                    query: { id: commodity.productId },
                  }"
                  >{{ commodity.name }}</router-link
                >
              </div>
              <div class="order-cols order-commodity__price">
                {{ commodity.price }}元
              </div>
              <div class="order-cols order-commodity__count">
                {{ commodity.count }}
              </div>
              <div class="order-cols order-commodity__cost">
                {{ commodity.cost }}元
              </div>
            </li>
            <li class="clearfix">
              <div class="order-commodity__allCount flex">
                共计
                <span>{{ item.allCount }}</span>
                件商品
              </div>
              <div class="order-commodity__allCost flex">
                合计：
                <span>{{ item.allCost }}</span
                >元
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
  <my-dialog v-model="showDialog">
    <div class="dialog-prompt">
      <svg-icon popper-class="icon-warn" icon-class="warn"></svg-icon>
      {{ promptMess }}
    </div>
    <template #footer>
      <n-button @click="showDialog = false" size="medium" color="#cac8c8"
        >取消</n-button
      >
      <n-button color="#ff6700" size="medium" @click="deleteOrder"
        >确认</n-button
      >
    </template>
  </my-dialog>
  <back-top />
</template>

<script lang="ts">
import { defineComponent, ref, reactive, defineProps } from "@vue/runtime-core";
import headerDatas from "@/staticDatas/orderHeaTitDatas";

export default defineComponent({
  name: "order-content",
  data() {
    return {
      headerDatas,
      isShowShadow: false, // 是否显示阴影
      targetEle: null, // 被观察的元素
      observe: null, // 观察函数
    };
  },
  mounted() {
    const ele: HTMLDivElement = document.getElementById(
      "order-header"
    ) as HTMLDivElement;

    /**
     * 被观察元素执行的回调函数
     * @param {IntersectionObserverEntry[]} entries - 所有被观察元素的一个数据集合
     */
    // eslint-disable-next-line no-undef
    const callback: IntersectionObserverCallback = (
      entries: IntersectionObserverEntry[]
    ): void => {
      entries.forEach((entry: IntersectionObserverEntry) => {
        if (entry.isIntersecting && this.isShowShadow)
          this.isShowShadow = false;
        else if (!entry.isIntersecting && !this.isShowShadow)
          this.isShowShadow = true;
        /**
         * 被观察的目标元素
         */
        this.targetEle = entry.target as any;
      });
    };

    this.observe = new IntersectionObserver(callback) as any;
    (this.observe as any).observe(ele);
  },
  beforeUnmount() {
    (this.observe as any).unobserve(this.targetEle);
  },
});
</script>

<script lang="ts" setup>
import myDialog from "@/components/ui-components/myDialog.vue";
import deleteBox from "../collect/deleteBox.vue";
import backTop from "@/components/indexMain/backTop.vue";
import { useMessage } from "naive-ui";
import { useStore } from "@/store/index";

const props = defineProps<{
  // eslint-disable-next-line no-undef
  datas: Array<Order>;
}>();
const $message = useMessage();
const store = useStore();

/**
 * 是否打开对提示对话框
 */
let showDialog = ref<boolean>(false);
/**
 * 对话框的提示信息
 */
let promptMess = ref<string>("");
/**
 * 是否选择全部订单
 */
let showSeleAll = ref<boolean>(false);
/**
 * 是否显示删除框按钮(当用户勾选了商品时会显示)
 */
let showPrompt = ref<boolean>(false);
/**
 * 当前所勾选订单的id集合
 */
let currSelectIds = reactive<Array<number>>([]);

/**
 * 取消已勾选的商品
 */
const cancelChecked: () => void = (): void => {
  if (showSeleAll.value) showSeleAll.value = false;
  if (showPrompt.value) showPrompt.value = false;
  currSelectIds.splice(0);
};

/**
 * 勾选某个订单
 * @param id - 该订单的id值
 */
const checkToItem: (id: number) => void = (id: number): void => {
  // 如果用户正在删除订单时直接退出函数
  if (isDelete.value) return;
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
    if (currSelectIds.length === props.datas.length) showSeleAll.value = true;
  }
};

/**
 * 打开确认移除某件收藏商品的对话框
 * @param mess - 对话框的提示信息
 */
const openDailogDele: (mess: string) => void = (mess: string): void => {
  showDialog.value = true;
  promptMess.value = mess;
};

/**
 * 是否正在删除订单中
 */
let isDelete = ref<boolean>(false);

/**
 * 删除订单
 */
const deleteOrder: () => void = (): void => {
  isDelete.value = true;
  showDialog.value = false; // 关闭对话框
  showPrompt.value = false; // 关闭删除框
  store
    .dispatch("OrderModule/deleteOrderDatas", { ids: currSelectIds })
    .then((res: boolean) => {
      if (res) {
        cancelChecked();
        $message.success("删除成功");
      } else {
        $message.error("删除失败");
        showPrompt.value = true;
      }
      isDelete.value = false;
    })
    .catch(() => {
      $message.error("删除失败");
      showPrompt.value = true;
      isDelete.value = false;
    });
};
</script>

<style lang="less" scoped>
.drop-shadow {
  background-image: linear-gradient(rgba(218, 220, 224) 5%, transparent);
  height: 6px;
}

.fade {
  .fade(0.2s, ease);
}

.delete-box__container {
  font-size: 16px;
  height: 60px;
  position: sticky;
  top: -1px;
}

.check-order {
  float: left;
  margin-right: 60px;
  .setWidHei(20px, 20px);
  border-radius: 50%;
  transition: background-color 0.25s;
}

.floatAl() {
  float: left;
  display: flex;
  align-items: center;
}

.order {
  margin-top: 10px;

  &-box {
    padding: 0 32px;
    color: extract(@colors, 1);
    font-size: 16px;

    li {
      display: block;
    }
  }

  &-content {
    margin-bottom: 50px;

    &__right {
      float: left;
      box-shadow: 0 15px 30px rgb(0 0 0 / 10%);
      width: 1080px;
      box-sizing: border-box;
    }

    &__header {
      padding: 20px;
      background-color: extract(@colors, 3);
      color: #fff;
    }

    &__title {
      margin: 0;
      background-color: hsla(0, 36%, 96%, 0.863);

      & > dt:first-child {
        width: 15%;
      }

      & > dt {
        .floatAl();
        height: 70px;
      }
    }
  }

  &-id {
    float: left;
  }

  &-date {
    float: right;
  }

  &-commodity {
    &__mess {
      width: 40%;
    }

    &__price,
    &__count,
    &__cost {
      width: 15%;
      justify-content: center;
    }

    &__img {
      width: 15%;
      text-align: center;

      img {
        .setWidHei(80px, 60px);
        object-fit: cover;
        margin-left: 30px;
      }
    }

    .allSty(@float) {
      float: @float;
      height: 60px;
      width: 15%;
    }

    .allSpan(@fontSize) {
      color: extract(@colors, 3);
      font-size: @fontSize;
    }

    &__allCount {
      .allSty(left);

      span {
        .allSpan(20px);
        margin: 0 5px;
      }
    }

    &__allCost {
      .allSty(right);

      span {
        .allSpan(26px);
        margin-right: 5px;
      }
    }
  }

  &-cols {
    height: 110px;
    padding: 20px 0;
    box-sizing: border-box;
    .floatAl();
    border-bottom: 1px solid #e2dfdf;
  }
}
</style>