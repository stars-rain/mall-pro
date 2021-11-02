<template>
  <h2 class="type-title">{{ title }}</h2>
  <div class="clearfix">
    <div v-if="title === '手机'" class="phone-left imgHover">
      <router-link
        class="phone-left__img"
        :to="{
          name: 'detailsPage',
          params: { title },
          query: { id: datas.product1?.id },
        }"
      >
        <img
          class="change-lazy"
          :data-src="datas.product1?.imgSrc"
          :src="require(`@/assets/empty/placeholder.220.png`)"
          width="234"
          height="220"
          style="margin-top: 197px"
          alt="无法加载此图片"
        />
      </router-link>
    </div>
    <ul v-else class="homeAppliances-left">
      <li class="imgHover">
        <router-link
          class="homeAppliances-left__img"
          :to="{
            name: 'detailsPage',
            params: { title },
            query: { id: datas.product1?.id },
          }"
        >
          <img
            class="change-lazy"
            :data-src="datas.product1?.imgSrc"
            :src="require(`@/assets/empty/placeholder.80.png`)"
            alt="无法加载此图片"
            width="110"
            height="110"
            style="margin: 95px 62px"
          />
        </router-link>
      </li>
      <li class="imgHover">
        <router-link
          class="homeAppliances-left__img"
          :to="{
            name: 'detailsPage',
            params: { title },
            query: { id: datas.product2?.id },
          }"
        >
          <img
            class="change-lazy"
            :data-src="datas.product2?.imgSrc"
            :src="require(`@/assets/empty/placeholder.80.png`)"
            alt="无法加载此图片"
            width="100"
            height="110"
            style="margin: 95px 62px"
          />
        </router-link>
      </li>
    </ul>
    <ul class="type-right">
      <li
        :class="{
          imgHover: true,
          'no-margin-right': index === 3 || index === 7,
        }"
        v-for="(item, index) in datas.products"
        :key="item.id"
      >
        <a href="javascript:void(0);" @click="jumpRouter(title, item.id)">
          <div class="type-right__img imglazy">
            <img
              class="lazy"
              :data-src="item?.imgSrc"
              :src="require(`@/assets/empty/placeholder.110.png`)"
              alt="无法加载此图片"
            />
          </div>
          <h3 class="type-right__name">{{ item.name }}</h3>
          <p class="type-right__desc">{{ item.description }}</p>
          <p class="type-right__price">
            {{ item.curPrice }}<del>{{ item.oriPrice }}</del>
          </p>
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";

export default defineComponent({
  name: "phone",
  props: {
    datas: {
      // eslint-disable-next-line no-undef
      type: Object as PropType<Phone>,
      required: true,
    },
    /**
     * 产品模块对应的名称(如：手机、家电)
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
.no-margin-right {
  margin-right: 0 !important;
}
.imgHover {
  transition: all 0.2s linear;

  &:hover {
    box-shadow: 0 15px 30px rgb(0 0 0 / 10%);
    transform: translate3d(0, -2px, 0);
  }
}

.phone-left {
  float: left;
  .setWidHei(234px, 614px);

  &__img {
    .setWidHei(100%, 100%);
  }
}

.homeAppliances-left {
  float: left;
  .setWidHei(234px, 628px);

  & > li {
    margin-bottom: 14px;
    display: block;
    .setWidHei(234px, 300px);
  }

  &__img {
    .setWidHei(100%, 100%);
  }
}

.type {
  &-title {
    font-size: 22px;
    font-weight: 200;
    margin: 0;
    line-height: 55px;
    color: extract(@colors, 1);
  }

  &-right {
    margin-left: 14px;
    width: 978px;
    float: left;

    & > li {
      margin: 0 14px 14px 0;
      background-color: extract(@colors, 4);

      & > a {
        .setWidHei(234px, 300px);
      }
    }

    &__img {
      .setWidHei(130px, 130px);
      margin: 30px auto 20px;

      img {
        .setWidHei(100%, 100%);
        aspect-ratio: auto 130 / 130;
        object-fit: cover;
      }
    }

    .same (@size, @color) {
      font-size: @size;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      color: @color;
    }

    &__name {
      .same(14px, extract(@colors, 1));
      height: 18px;
      margin: 0;
      font-weight: 400;
    }

    &__desc {
      .same(12px, #b0b0b0);
      height: 16px;
      margin: 8px 0;
    }

    &__price {
      font-size: 14px;
      margin-top: 10px;
      text-align: center;
      color: extract(@colors, 3);

      del {
        color: #b0b0b0;
        margin-left: 8px;
      }
    }
  }
}
</style>