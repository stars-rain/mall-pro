<template>
  <div class="footer-container">
    <div class="footer clearfix container">
      <div class="footer-logo">
        <a class="logo" href="javascript:void(0)" @click="refresh"></a>
      </div>
      <div class="footer-types">
        <ul @mouseleave="currentTitle = ''">
          <li
            class="commodity-type"
            v-for="item in commodityTypesDatas"
            :key="item.id"
            @mouseenter="handleToTitle(item.title)"
          >
            <a href="javascript:void(0);">{{ item.title }}</a>
            <!-- 每类商品类型的子数据 -->
            <collapse-transition>
              <children-item
                :class="{
                  'opacity-item':
                    item.title === beforeTitle && currentTitle !== '',
                }"
                :data-active="currentTitle"
                :data-before-active="beforeTitle"
                v-show="item.title === currentTitle"
                :data="item.products"
              ></children-item
            ></collapse-transition>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from "vue";
import childrenItem from "./childrenItem.vue";

export default defineComponent({
  name: "header-footer",
  components: {
    childrenItem,
  },
});
</script>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
/**
 * 刷新页面
 */
const refresh: () => void = (): void => router.go(0);

/**
 * @type {Array} 头部商品分类导航数据
 */
// eslint-disable-next-line no-undef
let commodityTypesDatas = ref<Array<CommodityTypes>>([]);
/* 组件挂载前向后端请求头部商品分类导航数据 */
onBeforeMount(async () => {
  const { data } = await axios.get("/");
  commodityTypesDatas.value = data;
});

/**
 * @type {string} 当前鼠标悬停在头部商品分类导航的类型
 */
let currentTitle = ref<string>("");
/**
 * @type {string} 当前鼠标悬停在头部商品分类导航的类型的上一次悬停类型
 */
let beforeTitle = ref<string>("");
/**
 * @function
 * 判断当前鼠标悬停在头部商品分类导航的哪个类型
 * @param {string} title - 当前鼠标悬停在头部商品分类导航的类型
 */
const handleToTitle: (title: string) => void = (title: string): void => {
  currentTitle.value = title;
};

/**
 * 监听当前鼠标悬停在头部商品分类导航的类型
 */
watch(
  (): string => currentTitle.value,
  (_newValue: string, oldValue: string): void => {
    beforeTitle.value = oldValue; // 记录当前鼠标悬停在头部商品分类导航的类型的上一次悬停类型
  }
);
</script>

<style lang="less" scoped>
.opacity-item {
  opacity: 0;
}
.widHei() {
  width: 56px;
  height: 56px;
}

.footer {
  height: 100px;

  &-container {
    position: relative;
  }

  &-logo {
    position: relative;
    margin-top: 28px;
    .widHei();
    float: left;
    .logo {
      .widHei();
      &::before {
        content: "";
        background: url("~@/assets/logo.png") no-repeat;
        background-size: 56px;
        position: absolute;
        top: 0;
        .widHei();
        transform: translateZ(0);
      }
    }
  }

  &-types {
    margin: 12px 0 0 250px;

    & > ul {
      width: 620px;
    }

    .commodity {
      &-type {
        &:hover {
          & > a {
            color: extract(@colors, 3);
          }
        }

        & > a {
          color: extract(@colors, 1);
          line-height: 88px;
          padding: 0 20px;
          transition: color 0.3s;
        }
      }
    }
  }
}
</style>