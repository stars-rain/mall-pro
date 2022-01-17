<template>
  <div class="cart-main__card">
    <div class="card-title">购物清单</div>
    <ul class="card-content">
      <li>
        <ul class="card-header clearfix">
          <li
            v-for="item in headerDatas"
            :class="item.className"
            :key="item.id"
          >
            <div
              :class="{
                checked: true,
                disabledChecked: !cartDiffLen || (!showSeleAll && isPayFor),
                isChecked: showSeleAll && currSelectIds.length,
                noChecked: !showSeleAll && !isPayFor && cartDiffLen,
              }"
              @click="selectAll"
              v-if="item.id === 1"
            >
              <svg-icon
                popper-class="icon-checked"
                v-show="showSeleAll && cartDiffLen"
                icon-class="check"
              ></svg-icon>
            </div>
            {{ item.title }}
          </li>
        </ul>
      </li>
      <li v-if="!cartDiffLen" class="cart-empty">
        <svg-icon popper-class="cart-empty" icon-class="cart"></svg-icon>
        <p>
          您还没有进行购物，赶紧点击进行<router-link class="to-shopping" to="/"
            >选购</router-link
          >吧
        </p>
      </li>
      <li
        v-else
        :class="{
          'cart-commodity--nolast': index !== cartDiffLen - 1,
        }"
        v-for="(item, index) in cartList"
        :key="item.id"
      >
        <ul class="clearfix" style="padding: 0 20px">
          <li class="cols cart-commodity__check clearfix cols-one">
            <div>
              <div
                :class="{
                  checked: true,
                  disabledChecked: !currSelectIds.includes(item.id) && isPayFor,
                  isChecked: currSelectIds.includes(item.id),
                  noChecked: !currSelectIds.includes(item.id) && !isPayFor,
                }"
              >
                <svg-icon
                  v-show="currSelectIds.includes(item.id)"
                  @click="checkToItem(item.id)"
                  popper-class="icon-checked"
                  icon-class="check"
                ></svg-icon>
              </div>
              <img
                class="cart-commodity__img"
                :src="item.imgSrc"
                alt="无法显示此图片"
              />
            </div>
          </li>
          <li class="cols cart-commodity__mess cart-commodity--name">
            <a
              class="aColor"
              href="javascript:void(0)"
              @click="jumpRouter(item.title, item.productId)"
            >
              {{ item.name }}</a
            >
          </li>
          <li class="cols cart-commodity__price cart-commodity--price">
            {{ item.price }}元
          </li>
          <li class="cols cart-commodity__count cart-commodity--count">
            <a
              class="counts-subtract"
              href="javascript:void(0)"
              @click="handleToTheCount(item.id, -1, item.count)"
            >
              <svg-icon icon-class="subtract"></svg-icon>
            </a>
            <input
              class="counts"
              :value="item.count"
              @blur="countBlur(item.id, item.count, $event)"
            />
            <a
              class="counts-add"
              href="javascript:void(0)"
              @click="handleToTheCount(item.id, 1)"
            >
              <svg-icon icon-class="add"></svg-icon>
            </a>
          </li>
          <li class="cols cart-commodity__cost cart-commodity--cost">
            {{ item.cost }}元
          </li>
          <li class="cols cart-commodity__opeartion">
            <svg-icon
              popper-class="icon-delete"
              icon-class="delete"
              @click="deleteCommodity(item.id)"
            ></svg-icon>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  defineProps,
  computed,
  ref,
  defineEmits,
  watch,
} from "@vue/runtime-core";
import headerDatas from "@/staticDatas/cartHeaTitDatas";

export default defineComponent({
  name: "cart-main",
  methods: {
    /**
     * 路由跳转(跳转至详情页)
     * @param title - 该商品所属类型
     * @param id - 该商品对应的id值
     */
    jumpRouter(title: string, id: number): void {
      this.$router.push({
        name: "detailsPage",
        params: { title },
        query: { id },
      });
    },
  },
});
</script>

<script lang="ts" setup>
import { useMessage } from "naive-ui";
import { useStore } from "@/store/index";
import { useActions } from "@/vuexHooks";
import { Base64 } from "js-base64";

const { handleToCount, changeToCount } = useActions(
  ["handleToCount", "changeToCount"],
  "CartModule"
);
const $message = useMessage();
const store = useStore();
const props = defineProps<{
  // eslint-disable-next-line no-undef
  cartList: Array<CartItem>; // 购物车数据列表
  selectIds: Array<number>; // 当前所勾选的商品的id集合
}>();
const emits = defineEmits<{
  (e: "update:selectIds", ids: Array<number>): void; // 通知父组件用户所勾选的商品id集合以改变
  (e: "handlerDeleId", id: number): void; // 通知父组件改变用户当前需要删除的商品id值
  (e: "handlerPrompt", mess: string): void; // 通知父组件改变对话框的提示
  (e: "handlerDialog", show: boolean): void; // 通知父组件改变对话框的状态
}>();

/**
 * 购物车中不同商品的总数量
 */
let cartDiffLen = computed(() => props.cartList.length);
/**
 * 用户是否在付款
 */
let isPayFor = computed(() => store.state.CartModule.isPayFor);
/**
 * 是否购选全部商品
 */
let showSeleAll = ref<boolean>(false);
/**
 * 当前所勾选的商品的id集合
 */
let currSelectIds = ref<Array<number>>([]);
// 监听当前已勾选商品的id集合，以便通知父组件对应改变其值
watch(
  (): Array<number> => currSelectIds.value,
  (newValue: Array<number>): void => {
    emits("update:selectIds", newValue);
  },
  {
    deep: true,
  }
);

watch(
  (): Array<number> => props.selectIds,
  (newValue: Array<number>): void => {
    currSelectIds.value = newValue;
  },
  {
    deep: true,
  }
);

/**
 * 挑选全部商品
 */
const selectAll: () => void = (): void => {
  if (!cartDiffLen.value || isPayFor.value) return; // 如果购物车中无数据则或者用户正在付款直接返回
  showSeleAll.value = !showSeleAll.value;
  // 如果此时所有商品都被选中则取消选中
  if (currSelectIds.value.length === cartDiffLen.value) {
    currSelectIds.value.splice(0);
    return;
  }
  props.cartList.forEach((item) => {
    if (!currSelectIds.value.includes(item.id))
      currSelectIds.value.push(item.id);
  });
};
/**
 * 挑选某件商品
 * @param id - 该件商品的id值
 */
const checkToItem: (id: number) => void = (id: number): void => {
  if (isPayFor.value) return; // 如果用户正在付款则直接退出
  // 如果id集合中已经包括了此id值的话就移除否则加入
  if (currSelectIds.value.includes(id)) {
    currSelectIds.value.splice(
      currSelectIds.value.findIndex((item) => item === id),
      1
    );
    if (showSeleAll.value) showSeleAll.value = false; // 如果此时全被选中则取消全选
  } else {
    currSelectIds.value.push(id);
    if (currSelectIds.value.length === cartDiffLen.value)
      showSeleAll.value = true;
  }
};

/**
 * 当商品数量输入框失去焦点时执行的动作
 * @param id - 对应商品的id值
 * @param count - 商品原来的数量
 */
const countBlur: (id: number, count: number, e: FocusEvent) => void = (() => {
  let throttle = false;
  return (id: number, count: number, e: FocusEvent): void => {
    if (isPayFor.value) {
      $message.error("正在付款，请稍后");
      (e.target as HTMLInputElement).value = count + ""; // 还原到原来的数量
      return;
    }
    // 数量输入框的值
    const value: string = (e.target as HTMLInputElement).value;
    if (/[^0-9]/g.test(value)) {
      (e.target as HTMLInputElement).value = count + ""; // 如果有非数字字符则还原到原来的数量
      $message.error("只能输入数字");
    } else if (value.startsWith("0") && value.length > 1) {
      $message.error("不能以0开头");
      (e.target as HTMLInputElement).value = count + ""; // 还原到原来的数量
    } else if (+value === 0) {
      $message.error("商品数量不能设置为0");
      (e.target as HTMLInputElement).value = count + ""; // 还原到原来的数量
    } else {
      if (throttle) {
        $message.error("操作太频繁");
        (e.target as HTMLInputElement).value = count + ""; // 如果有非数字字符则还原到原来的数量
        return;
      }
      throttle = true;
      changeToCount({
        account: Base64.encode(store.state.UserModule.account),
        id,
        count: +value,
      })
        .then((value: boolean): void => {
          if (value) throttle = false;
        })
        .catch(() => {
          $message.error("出错了");
          throttle = false;
        });
    }
  };
})();
// 改变对应商品的数量
const handleToTheCount: (id: number, count: number, oriCount?: number) => void =
  (() => {
    let throttle = false;
    return (id: number, count: number, oriCount?: number): void => {
      if (!isPayFor.value) {
        if (throttle) {
          $message.error("操作太频繁");
          return;
        }
        throttle = true;
        if (oriCount === 1 && count === -1) {
          // 如果用户所购商品已经是0还减少的话则抛出操作错误提示
          $message.error("商品数量不能为0");
          throttle = false;
          return;
        }
        handleToCount({
          account: Base64.encode(store.state.UserModule.account),
          id,
          count,
        })
          .then((value: boolean): void => {
            if (value) throttle = false;
          })
          .catch(() => {
            $message.error("出错了");
            throttle = false;
          });
      }
    };
  })();

// 用户删除购物车中的某件商品
const deleteCommodity: (id: number) => void = (id: number): void => {
  if (!isPayFor.value) {
    emits("handlerDeleId", id); // 通知父组件用户准备删除该件商品
    emits("handlerPrompt", "确认将该件商品从购物车中移除？"); // 改变对话框的提示
    emits("handlerDialog", true); // 打开对话框
  }
};
</script>

<style lang="less" scoped>
.cols {
  height: 110px;
  float: left;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  &-one {
    & > div {
      display: flex;
      align-items: center;
    }
  }
}

.disabledChecked {
  .checked();
  cursor: not-allowed;
}

.cart {
  &-empty {
    padding: 30px 0;
    text-align: center;
    color: rgb(177, 173, 173);
    font-size: 14px;

    .to-shopping {
      color: #ff3c00;
      font-size: 16px;
      margin: 0 5px;
      transition: color 0.2s;

      &:hover {
        color: #eb5b2f;
      }
    }

    .cart-empty {
      font-size: 55px;
    }

    p {
      margin: 0;
    }
  }

  &-main {
    &__card {
      .cardSty();
      color: extract(@colors, 1);

      .card {
        &-title {
          font-size: 20px;
          font-weight: 600;
          padding: 10px 20px;
          color: extract(@colors, 3);
        }

        &-header {
          padding: 0 20px;
          background-color: #fcf8f8dc;
          font-size: 14px;

          li {
            height: 60px;
            display: flex;
            align-items: center;
            float: left;
          }
        }

        &-content {
          & > li {
            display: block;
          }
        }
      }
    }
  }

  &-commodity {
    &--nolast {
      border-bottom: 1px solid #e2dfdf;
    }

    &__all,
    &__check {
      width: 18%;
    }

    &__mess {
      width: 35%;
    }

    &__price,
    &__count,
    &__cost {
      width: 14%;
      justify-content: center;
    }

    &_operation {
      width: 5%;
    }

    &__img {
      .setWidHei(80px, 60px);
      object-fit: cover;
      margin-left: 30px;
    }

    &--name {
      font-size: 16px;
    }

    &--price {
      font-size: 15px;
    }

    &--count {
      font-size: 15px;
    }

    &--cost {
      font-size: 15px;
      color: extract(@colors, 3);
    }
  }
}

.checked {
  float: left;
  text-align: center;
  line-height: 18px;
  margin-right: 15px;
  .setWidHei(18px, 18px);
  font-size: 18px;
  transition: background-color 0.25s;
}

.icon-delete {
  font-size: 18px;
  color: #817f7f;
  transition: color 0.2s;
  cursor: pointer;

  &:hover {
    color: extract(@colors, 3);
  }
}

.counts {
  .borSty() {
    border-bottom: 1px solid rgb(224, 224, 230);
    border-top: 1px solid rgb(224, 224, 230);
  }

  .borSty();
  .setWidHei(60px, 42px);
  border-right: 0;
  border-left: 0;
  text-align: center;
  font-size: 15px;

  &:focus {
    outline: none;
  }

  .thame() {
    color: #807d7d;
    .setWidHei(22px, 44px);
    font-size: 20px;
    text-align: center;
    line-height: 44px;
    .borSty();
  }

  &-subtract {
    .thame();
    border-radius: 22px 0 0 22px;
    border-left: 1px solid rgb(224, 224, 230);
  }

  &-add {
    .thame();
    border-radius: 0 22px 22px 0;
    border-right: 1px solid rgb(224, 224, 230);
  }
}
</style>