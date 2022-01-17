<template>
  <loading-bar ref="loadingBar">
    <views-title
      title="我的收藏"
      :len="collectLen"
      icon-class="collect"
    ></views-title>
    <router-view />
    <pagination :max-page="maxPage" :page="needPage" />
  </loading-bar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Cookie from "@/plugins/cookie";
import { Base64 } from "js-base64";
import { mapState } from "vuex";
import viewsTitle from "../viewsTitle.vue";
import pagination from "./pagination.vue";

export default defineComponent({
  name: "collect",
  components: {
    viewsTitle,
    pagination,
  },
  computed: {
    ...mapState("CollectModule", ["collectLen", "needPage"]),
    ...mapState("UserModule", ["isLogin", "account"]),
    maxPage(): number {
      const isZero = this.collectLen % 12 === 0;
      const count: number = Math.trunc(this.collectLen / 12);
      return isZero ? count : count + 1;
    },
  },
  beforeMount() {
    this.$nextTick(() => {
      // eslint-disable-next-line no-undef
      const index: number = globalThis.location.href.indexOf("?page=");
      // eslint-disable-next-line no-undef
      const page: number = +globalThis.location.href.substring(index + 6);
      if (Number.isNaN(page) || page <= 0) this.$router.replace("/404");
      else {
        this.$store.commit("CollectModule/handleToNeedPage", { page });
        // 如果购物车状态发生改变的话
        (this.$refs.loadingBar as any).start();
        if (this.isLogin)
          this.$store
            .dispatch("CollectModule/getCollect", {
              account: Base64.encode(this.account),
              page,
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
              .dispatch("CollectModule/getCollect", {
                account: Base64.encode(account),
                page,
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
            // 清空收藏数据
            this.$store.commit("CollectModule/clearCollectDatas");
            setTimeout(() => (this.$refs.loadingBar as any).finish(), 100);
          }
        }
      }
    });
  },
});
</script>