<template>
  <div class="mall-header">
    <!-- 商城头部组件 -->
    <mall-header></mall-header>
    <div class="container">
      <mall-header-carousel :datas="carouselData"></mall-header-carousel>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import mallHeader from "@/components/header/header.vue";
import mallHeaderCarousel from "@/components/header/carousel/index.vue";
import { mapMutations } from "vuex";

export default defineComponent({
  name: "index",
  components: {
    mallHeader,
    mallHeaderCarousel,
  },
  computed: {
    // 头部轮播图数据
    // eslint-disable-next-line no-undef
    carouselData(): Array<Carousel> {
      return this.$store.state.carouselDatas;
    },
  },
  methods: {
    ...mapMutations(["getCommodityTypesDatas", "getCarouselDatas"]),
  },
  beforeMount() {
    // 请求头部商品分类导航数据和轮播图数据
    Promise.all([this.getCommodityTypesDatas(), this.getCarouselDatas()]);
  },
});
</script>

<style lang="less" scoped>
.mall {
  &-header {
    height: 40px;
    background-color: extract(@colors, 1);
  }
}
</style>