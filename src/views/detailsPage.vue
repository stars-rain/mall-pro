<template>
  <loading-bar ref="loadingBar">
    <!-- 商城头部组件 -->
    <n-message-provider>
      <mallHeader>
        <header-footer
          :commodity-types-datas="commodityTypesDatas"
        ></header-footer> </mallHeader
    ></n-message-provider>
    <div class="details">哈哈哈哈 {{ id }} {{ title }}</div></loading-bar
  >
</template>

<script lang="ts">
import { defineComponent, defineProps, watchEffect } from "@vue/runtime-core";
import mallHeader from "@/components/header/header.vue";
import headerFooter from "../components/header/footer.vue";
import { mapActions } from "vuex";

export default defineComponent({
  name: "detailsPage",
  components: {
    mallHeader,
    headerFooter,
  },
  computed: {
    // 头部商品分类导航数据
    // eslint-disable-next-line no-undef
    commodityTypesDatas(): Array<CommodityTypes> {
      return this.$store.state.commodityTypesDatas;
    },
  },
  beforeRouteUpdate() {
    console.log("啊哈哈哈");
  },
  methods: {
    ...mapActions([
      "getCommodityTypesDatas", // 请求头部商品分类导航数据
    ]),
  },
  beforeMount() {
    this.$nextTick(() => {
      // 加载条开始滚动
      (this.$refs.loadingBar as any).start();
      // 请求头部商品分类导航数据、头部商品轮播图数据、手机以及家电商品数据
      Promise.all([this.getCommodityTypesDatas()])
        .then((res: boolean[]) => {
          // 数据全部获取成功则关闭加载条
          if (!res.includes(false)) (this.$refs.loadingBar as any).finish();
        })
        .catch(() => this.$router.replace("/404")); // 获取失败则定位到404页面
    });
  },
});
</script>

<script lang="ts" setup>
import { useRoute } from "vue-router";
// import { $axios } from "@/plugins/axios";

const route = useRoute();

defineProps<{
  id: string;
  title: string;
}>();

watchEffect(() => {
  console.log(route.params.title, route.query.id);
});
</script>

<style lang="less" scoped>
.details {
  font-size: 16px;
}
</style>