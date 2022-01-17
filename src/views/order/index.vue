<template>
  <loading-bar ref="loadingBar">
    <views-title
      id="order-header"
      icon-class="order"
      :len="orderDatas.length"
      title="历史订单"
    ></views-title>
    <order-content
      v-if="orderDatas.length > 0"
      :datas="orderDatas"
    ></order-content>
    <order-empty
      v-else
      icon-class="orderEmpty"
      title="还没有发现订单，现在开始"
    ></order-empty>
  </loading-bar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Base64 } from "js-base64";
import { mapState } from "vuex";
import Cookie from "@/plugins/cookie";
import viewsTitle from "../viewsTitle.vue";
import orderEmpty from "../empty.vue";
import orderContent from "./content.vue";

export default defineComponent({
  name: "order",
  components: {
    viewsTitle,
    orderEmpty,
    orderContent,
  },
  computed: {
    // eslint-disable-next-line no-undef
    orderDatas(): Array<Order> {
      return this.$store.state.OrderModule.orderDatas;
    },
    ...mapState("UserModule", ["isLogin", "account"]),
  },
  beforeMount() {
    this.$nextTick(() => {
      (this.$refs.loadingBar as any).start();
      if (this.isLogin)
        this.$store
          .dispatch("OrderModule/getOrderDatas", {
            account: Base64.encode(this.account),
          })
          .then((res: boolean): void => {
            if (res) (this.$refs.loadingBar as any).finish();
            else this.$router.replace("/404");
          })
          .catch(() => this.$router.replace("/404"));
      else {
        const account: string = Cookie.getCookie().account;
        const boo: boolean = account && account.length === 8 ? true : false;
        if (boo) {
          this.$store
            .dispatch("OrderModule/getOrderDatas", {
              account: Base64.encode(account),
            })
            .then((res: boolean) => {
              if (res) {
                (this.$refs.loadingBar as any).finish();
                this.$store
                  .dispatch("UserModule/getUserMessage", {
                    account: Base64.encode(account),
                  })
                  .then((res: boolean) => {
                    if (res)
                      // 刷新页面时如果cookie中有用户账号的话则把此账号保存到vuex的UserModule中
                      this.$store.commit("UserModule/handleToAccount", {
                        account,
                      });
                    else Cookie.deleteCookie();
                  })
                  .catch(() => Cookie.deleteCookie());
              } else this.$router.replace("/404");
            });
        } else {
          // 清空订单数据
          this.$store.commit("OrderModule/clearOrderDatas");
          setTimeout(() => (this.$refs.loadingBar as any).finish(), 100);
        }
      }
    });
  },
});
</script>