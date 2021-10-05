<template>
  <div class="item-children">
    <div class="item-children__container">
      <ul>
        <li v-for="(item, index) in data" :key="item.id">
          <a href="javascript:void(0);">
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
  name: "liItem",
  props: {
    data: {
      // eslint-disable-next-line no-undef
      type: Array as PropType<Array<commodity>>,
      required: true,
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

  &__container {
    width: @width;
    margin: 0 auto;

    & > ul {
      margin: 30px 0 15px;
      padding: 0 12px;
    }

    .item {
      &-img {
        width: 160px;
        height: 110px;

        img {
          .widHei();
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
          width: 0.1rem;
          height: 100px;
          margin: 10px auto;
          background-color: extract(@colors, 5);
        }
      }
    }
  }
}
</style>