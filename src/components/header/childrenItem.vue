<template>
  <div class="item-children">
    <div class="item-children__container">
      <ul>
        <li v-for="(item, index) in data" :key="item.id">
          <a href="javascript:void(0);" @click="jumpRouter(title, item.id)">
            <div class="item-img">
              <img :src="item.imgSrc" alt="无法加载此图片" />
            </div>
            <p class="item-name">{{ item.name }}</p>
            <p class="item-cost">{{ item.curPrice }}</p>
          </a>
          <div class="item-spa" v-if="index + 1 !== data.length">
            <div></div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "childrenItem",
  emits: {
    ["update:currentTitle"]<T>(str: T) {
      if (typeof str === "string") return true;
    },
  },
  props: {
    data: {
      // eslint-disable-next-line no-undef
      type: Array as PropType<Array<Commodity>>,
      required: true,
    },
    /**
     * 该件商品对应的类型
     */
    title: {
      type: String,
      required: true,
    },
  },
  methods: {
    /**
     * 路由跳转(跳转至详情页)
     * @param title - 该商品所属类型
     * @param id - 该商品对应的id值
     */
    jumpRouter(title: string, id: number): void {
      // 进入商品详情页折叠子导航栏
      this.$emit("update:currentTitle", "");
      this.$router.push({
        name: "detailsPage",
        params: { title },
        query: { id },
      });
    },
  },
});
</script>

<style lang="less" scoped>
.item-children {
  border-top: 1px solid extract(@colors, 5);
  position: absolute;
  width: 100%;
  box-shadow: 0 15px 10px -15px rgb(0 0 0 / 10%);
  top: 100px;
  left: 0;
  background-color: extract(@colors, 4);
  z-index: 100;

  &__container {
    width: @width;
    margin: 0 auto;

    & > ul {
      margin: 30px 0 15px;
      padding: 0 12px;
    }

    .item {
      &-img {
        .setWidHei(160px, 110px);

        img {
          .setWidHei(100%, 100%);
          aspect-ratio: auto 160 / 110;
        }
      }

      .costna(@number, @size) {
        text-align: center;
        color: extract(@colors, @number);
        font-size: @size;
      }

      &-name {
        .costna(2, 13px);
        margin-top: 20px;
      }

      &-cost {
        .costna(3, 13px);
        line-height: 12px;
      }

      &-spa {
        width: 48px;
        display: inline-block;
        vertical-align: top;

        & > div {
          .setWidHei(0.1rem, 100px);
          margin: 10px auto;
          background-color: extract(@colors, 5);
        }
      }
    }
  }
}
</style>