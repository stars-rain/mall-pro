<template>
  <loading-bar ref="loadingBar">
    <cart-header :cart-len="cartLen"></cart-header>
    <div class="cart-container">
      <cart-main
        :cart-list="cartList"
        @handler-selectids="handlerSelectids"
        @handler-prompt="handlerPrompt"
        @handler-Dialog="handlerDialog"
        @handler-dele-id="handlerDeleId"
      ></cart-main>
      <cart-footer
        :select-ids="selectIds"
        :cart-list="cartList"
        @handler-prompt="handlerPrompt"
        @handler-Dialog="handlerDialog"
      ></cart-footer>
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
        <n-button
          color="#ff6700"
          size="medium"
          @click="handleToCommodity(prompt)"
          >确认</n-button
        >
      </template>
    </my-dialog></loading-bar
  >
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "@vue/runtime-core";
import cartMain from "./cartMain.vue";
import { Base64 } from "js-base64";
import Cookie from "@/plugins/cookie";
import { mapState } from "vuex";

export default defineComponent({
  name: "cart",
  computed: {
    ...mapState("UserModule", ["isLogin", "account"]),
  },
  beforeMount() {
    this.$nextTick(() => {
      // 如果购物车状态发生改变的话
      (this.$refs.loadingBar as any).start();
      if (this.$store.state.CartModule.status === 1 && this.isLogin) {
        this.$store
          .dispatch("CartModule/getCartDatas", {
            account: Base64.encode(this.account),
          })
          .then((value: boolean): void => {
            if (value) {
              this.$store.commit("CartModule/handleToStatus"); // 初始化用户购物车状态未发生改变
              (this.$refs.loadingBar as any).finish();
            }
          })
          .catch(() => this.$router.replace("/404")); // 获取失败则定位到404页面
      } else if (this.$store.state.CartModule.status === 1 && !this.isLogin) {
        const account: string = Cookie.getCookie().account;
        const boo: boolean = account && account.length === 8 ? true : false;
        if (boo) {
          // 刷新页面时如果cookie中有用户账号的话则把此账号保存到vuex的UserModule中
          this.$store.commit("UserModule/handleToAccount", { account });
          Promise.all([
            this.$store.dispatch("UserModule/getUserMessage", {
              account: Base64.encode(account),
            }),
            this.$store.dispatch("CartModule/getCartDatas", {
              account: Base64.encode(account),
            }),
          ])
            .then((res: boolean[]): void => {
              // 数据全部获取成功则关闭加载条
              if (!res.includes(false)) {
                this.$store.commit("CartModule/handleToStatus"); // 初始化用户购物车状态未发生改变
                (this.$refs.loadingBar as any).finish();
              }
            })
            .catch(() => this.$router.replace("/404"));
        } else setTimeout(() => (this.$refs.loadingBar as any).finish(), 100);
      } else setTimeout(() => (this.$refs.loadingBar as any).finish(), 100);
    });
  },
});
</script>

<script lang="ts" setup>
import { useStore } from "@/store/index";
import { useMessage } from "naive-ui";
import { useActions } from "@/vuexHooks";
import { deepClone } from "@/plugins/deepClone";
import myDialog from "@/components/ui-components/myDialog.vue";
import cartHeader from "./cartHeader.vue";
import cartFooter from "./cartFooter.vue";

const $message = useMessage();
const store = useStore();
const { deleteCart, clearCart } = useActions(
  ["deleteCart", "clearCart"],
  "CartModule"
);
/**
 * 购物车商品数据列表
 */
let cartList = computed(() => store.state.CartModule.cartList);
/**
 * 购物车中商品的总数量
 */
let cartLen = computed((): number => {
  let len: number = 0;
  if (cartList.value.length)
    cartList.value.forEach((item) => (len += item.count));
  return len;
});

/**用户当前需要删除的商品id值*/
let deleId = ref<number>(0);
/**
 * 是否显示删除提示对话框
 */
let showDialog = ref<boolean>(false);
/**
 * 对话框的提示信息
 */
let prompt = ref<string>("");
/**
 * 当前所勾选的商品的id集合
 */
let selectIds = ref<Array<number>>([]);

/**
 * 勾选的商品总件数
 */
let selectIdsLen = computed((): number => {
  let len: number = 0;
  cartList.value.forEach((item) => {
    if (selectIds.value.includes(item.id)) len += item.count;
  });
  return len;
});
// 改变其用户已勾选的商品id值的集合
const handlerSelectids: (ids: Array<number>) => void = (
  ids: Array<number>
): void => {
  selectIds.value = deepClone(ids);
};
/**
 * 改变用户当前需要删除的商品id值
 * @param id - 对应商品的id值
 */
const handlerDeleId: (id: number) => void = (id: number): void => {
  deleId.value = id;
};
/**
 * 改变对话框的提示
 * @param mess - 对话框的具体提示信息
 */
const handlerPrompt: (mess: string) => void = (mess: string): void => {
  prompt.value = mess;
};
/**
 * 改变对话框状态
 * @param show - 是打开还是关闭对话框
 */
const handlerDialog: (show: boolean) => void = (show: boolean): void => {
  showDialog.value = show;
};
/**
 * 打开对话框对购物车商品进行操作
 * @param mess - 提示操作信息
 */
const handleToCommodity: (mess: string) => void = (mess: string): void => {
  switch (mess) {
    case "确认将该件商品从购物车中移除？": {
      deleteCart({
        ids: [deleId.value],
        account: Base64.encode(store.state.UserModule.account),
      })
        .then((value: boolean) => {
          if (value) $message.success("删除成功");
          else $message.error("删除失败");
        })
        .catch(() => $message.error("删除失败"));
      break;
    }
    case "是否清空购物车？":
      clearCart({
        account: Base64.encode(store.state.UserModule.account),
      })
        .then((value: boolean): void => {
          if (value) $message.success("成功清空购物车");
          else $message.error("清空失败");
        })
        .catch(() => $message.error("清空失败"));
      break;
    case `是否删除已选中的${selectIdsLen.value}件商品`: {
      store
        .dispatch("CartModule/deleteCart", {
          ids: selectIds.value,
          account: Base64.encode(store.state.UserModule.account),
        })
        .then((value: boolean) => {
          if (value) $message.success("删除成功");
          else $message.error("删除失败");
        })
        .catch(() => $message.error("删除失败"));
      break;
    }
  }
  handlerDialog(false); // 关闭对话框
};
</script>

<style lang="less" scoped>
.cart {
  &-container {
    background-color: #f5f5f5;
    padding: 25px 40px;
    box-sizing: border-box;
    color: #333;
  }
}
.dialog-prompt {
  text-align: center;
  margin: 20px 0 30px 0;
  font-size: 18px;

  .icon-warn {
    color: extract(@colors, 3);
    font-size: 20px;
    margin-right: 3px;
  }
}
</style>