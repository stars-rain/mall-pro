<template>
  <loading-bar ref="loadingBar">
    <!-- 商城头部组件 -->
    <n-message-provider>
      <mall-header>
        <header-footer
          :commodity-types-datas="commodityTypesDatas"
        ></header-footer> </mall-header
    ></n-message-provider>
    <div>
      <div class="container">
        <mall-main-carousel :datas="carouselDatas"></mall-main-carousel>
      </div>
    </div>
    <div class="mall-main">
      <div class="container">
        <mall-main-type :datas="phoneDatas" title="手机"></mall-main-type>
        <mall-main-type :datas="homeAppliances" title="家电"></mall-main-type>
      </div></div
  ></loading-bar>
  <back-top></back-top>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import mallMainCarousel from "../components/indexMain/carousel/index.vue";
import mallMainType from "../components/indexMain/mallType.vue";
import mallHeader from "@/components/header/header.vue";
import headerFooter from "../components/header/footer.vue";
import { mapActions } from "vuex";
import backTop from "@/components/indexMain/backTop.vue";
import Cookie from "@/plugins/cookie";
import { Base64 } from "js-base64";

export default defineComponent({
  name: "index",
  components: {
    mallHeader,
    mallMainCarousel,
    mallMainType,
    headerFooter,
    backTop,
  },
  computed: {
    // 头部商品分类导航数据
    // eslint-disable-next-line no-undef
    commodityTypesDatas(): Array<CommodityTypes> {
      return this.$store.state.commodityTypesDatas;
    },
    // 头部轮播图数据
    // eslint-disable-next-line no-undef
    carouselDatas(): Array<Carousel> {
      return this.$store.state.carouselDatas;
    },
    // 手机模块的商品数据
    // eslint-disable-next-line no-undef
    phoneDatas(): Phone {
      return this.$store.state.phoneDatas;
    },
    // 家电模块的商品数据
    // eslint-disable-next-line no-undef
    homeAppliances(): Phone {
      return this.$store.state.homeAppliances;
    },
  },
  data() {
    return {
      timing: 0, // 用来保存setTimeout函数
    };
  },
  methods: {
    ...mapActions([
      "getCommodityTypesDatas", // 请求头部商品分类导航数据
      "getCarouselDatas", // 头部商品轮播图数据
      "getPhoneDatas", // 手机商品数据
      "getHomeAppliances", // 家电商品数据
    ]),
  },
  mounted() {
    this.$nextTick(() => {
      // 加载条开始滚动
      (this.$refs.loadingBar as any).start();
      /**
       * cookie中登录用户的账号
       */
      const account: string = Cookie.getCookie().account;
      const boo: boolean =
        !this.$store.state.UserModule.isLogin && account && account.length === 8
          ? true
          : false;
      // 请求头部商品分类导航数据、头部商品轮播图数据、手机以及家电商品数据
      Promise.all([
        this.getCommodityTypesDatas(),
        this.getCarouselDatas(),
        this.getPhoneDatas(),
        this.getHomeAppliances(),
      ])
        .then((res: boolean[]) => {
          // 数据全部获取成功则关闭加载条
          if (!res.includes(false)) {
            if (boo) {
              this.$store
                .dispatch("UserModule/getUserMessage", {
                  account: Base64.encode(account),
                })
                .then((res: boolean) => {
                  if (res) {
                    (this.$refs.loadingBar as any).finish();
                    this.$store.commit("UserModule/handleToAccount", {
                      account,
                    });
                  } else {
                    (this.$refs.loadingBar as any).finish();
                    Cookie.deleteCookie();
                  }
                })
                .catch(() => {
                  (this.$refs.loadingBar as any).finish();
                  Cookie.deleteCookie();
                });
            } else (this.$refs.loadingBar as any).finish();
          }

          this.timing = setTimeout(() => {
            /**
             * 需要懒加载的图片元素集合(真实图片加载出来后不需要改变其大小)
             **/
            const ele1: Array<HTMLImageElement> = Array.from(
              document.querySelectorAll(".lazy")
            );
            /**
             * 需要懒加载的图片元素集合(真实图片加载出来后需要改变其大小)
             **/
            const ele2: Array<HTMLImageElement> = Array.from(
              document.querySelectorAll(".change-lazy")
            );
            (this as any).$observer(ele1);
            (this as any).$observer(ele2, true);
          }, 700);
        })
        .catch((error) => {
          console.log(error);
          this.$router.replace("/404");
        }); // 获取失败则定位到404页面
    });
  },
  beforeUnmount() {
    if (this.timing) clearTimeout(this.timing);
  },
});
</script>

<style lang="less" scoped>
.mall {
  &-main {
    margin-top: 20px;
    background: #f5f5f5;
    padding: 10px 0 20px;
  }
}
</style>