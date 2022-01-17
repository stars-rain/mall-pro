<template>
  <div class="pagination" v-if="maxPage !== 1 && maxPage !== 0">
    <div class="container pagination-content">
      <ul>
        <li class="turn-page__before">
          <a
            :class="{
              'turn-page--disabled': currentPage === 1,
              aColor: currentPage !== 1,
            }"
            href="javascript:void(0)"
            @click="turnPage(-1)"
          >
            <svg-icon icon-class="leftArrow"></svg-icon>
          </a>
        </li>
        <template v-if="maxPage <= 8">
          <li class="page-box" v-for="item in maxPage" :key="item">
            <router-link
              :class="{
                aColor: true,
                'page-current': item === currentPage,
              }"
              :to="{ path: '/collect/index', query: { page: item } }"
              @click="currentPage = item"
              >{{ item }}</router-link
            >
          </li>
        </template>
        <template v-else-if="currentPage >= 5">
          <li class="page-box">
            <router-link
              :class="{
                aColor: true,
              }"
              href="javascript:void(0)"
              :to="{ path: '/collect/index', query: { page: 1 } }"
              @click="currentPage = 1"
              >1</router-link
            >
          </li>
          <li class="turn-page__symbol">
            <a
              class="turn-symbol"
              href="javascript:void(0)"
              @click="jumpTurnPage(-3)"
            >
              <svg-icon
                popper-class="symbol-ellipsis"
                icon-class="ellipsis"
              ></svg-icon>
              <svg-icon
                popper-class="symbol-doubleArrow"
                icon-class="doubleArrowRight"
                style="transform: rotate(180deg)"
              ></svg-icon>
            </a>
          </li>
          <li v-for="item in pageFourSize" :key="item" class="page-box">
            <router-link
              :class="{
                aColor: true,
                'page-current': item === currentPage,
              }"
              :to="{ path: '/collect/index', query: { page: item } }"
              @click="currentPage = item"
              >{{ item }}</router-link
            >
          </li>
          <template v-if="currentPage < maxPage - 4">
            <li class="turn-page__symbol">
              <a
                class="turn-symbol"
                href="javascript:void(0)"
                @click="jumpTurnPage(3)"
              >
                <svg-icon
                  popper-class="symbol-ellipsis"
                  icon-class="ellipsis"
                ></svg-icon>
                <svg-icon
                  popper-class="symbol-doubleArrow"
                  icon-class="doubleArrowRight"
                ></svg-icon>
              </a>
            </li>
          </template>
          <template v-else>
            <li style="margin-right: 20px">
              <router-link
                :class="{
                  aColor: true,
                  'page-current': currentPage === maxPage - 1,
                }"
                :to="{ path: '/collect/index', query: { page: maxPage - 1 } }"
                @click="currentPage = maxPage - 1"
                >{{ maxPage - 1 }}</router-link
              >
            </li></template
          >
          <li style="margin-right: 20px">
            <router-link
              :class="{
                aColor: true,
                'page-current': currentPage === maxPage,
              }"
              :to="{ path: '/collect/index', query: { page: maxPage } }"
              @click="currentPage = maxPage"
              >{{ maxPage }}</router-link
            >
          </li>
        </template>
        <template v-else>
          <li class="page-box" v-for="item in 6" :key="item">
            <router-link
              :class="{
                aColor: true,
                'page-current': item === currentPage,
              }"
              :to="{ path: '/collect/index', query: { page: item } }"
              @click="currentPage = item"
              >{{ item }}</router-link
            >
          </li>
          <li class="turn-page__symbol">
            <a
              class="turn-symbol"
              href="javascript:void(0)"
              @click="jumpTurnPage(3)"
            >
              <svg-icon
                popper-class="symbol-ellipsis"
                icon-class="ellipsis"
              ></svg-icon>
              <svg-icon
                popper-class="symbol-doubleArrow"
                icon-class="doubleArrowRight"
              ></svg-icon>
            </a>
          </li>
          <li style="margin-right: 20px">
            <router-link
              :class="{
                aColor: true,
                'page-current': currentPage === maxPage,
              }"
              :to="{ path: '/collect/index', query: { page: maxPage } }"
              @click="currentPage = maxPage"
              >{{ maxPage }}</router-link
            >
          </li>
        </template>
        <li class="turn-page__after">
          <a
            :class="{
              'turn-page--disabled': currentPage === maxPage,
              aColor: currentPage !== maxPage,
            }"
            href="javascript:void(0)"
            @click="turnPage(1)"
          >
            <svg-icon icon-class="rightArrow"></svg-icon>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "pagination",
  props: {
    /**
     * 最大页码数
     */
    maxPage: {
      type: Number,
      default: 1,
    },
    /**
     * 当前页面所需要显示的页码数
     */
    page: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      currentPage: 1,
      pageFourSize: [] as Array<number>,
    };
  },
  beforeMount() {
    if (this.page <= this.maxPage) this.currentPage = this.page;
  },
  methods: {
    /**
     * 通过左右图标跳转页面
     * @param count - 是跳转上一页还是下一页(例如: +1代表下一页)
     */
    turnPage(count: number): void {
      if (
        !(count === -1 && this.currentPage === 1) &&
        !(count === 1 && this.currentPage === this.maxPage)
      )
        this.currentPage += count;
      this.$router.push({
        path: "/collect/index",
        query: { page: this.currentPage },
      });
    },
    /**
     * 跳转页面(间隔为3)
     * @param count - 是跳转前3页还是后3页
     */
    jumpTurnPage(count: number): void {
      this.currentPage += count;
      this.$router.push({
        path: "/collect/index",
        query: { page: this.currentPage },
      });
    },
  },
  watch: {
    currentPage(newValue: number): void {
      let temp: Array<number> = [];
      if (newValue >= 5 && newValue <= this.maxPage - 4)
        for (let i = newValue - 1; i <= newValue + 2; i++) temp.push(i);
      else
        for (let i = this.maxPage - 5; i <= this.maxPage - 2; i++) temp.push(i);
      this.pageFourSize = temp;
    },
    page(newValue: number): void {
      this.currentPage = newValue;
    },
  },
});
</script>

<style lang="less" scoped>
.pagination {
  background-color: rgb(248, 249, 250);
  font-size: 16px;

  &-content {
    padding-bottom: 20px;
    text-align: center;

    .page {
      &-box {
        margin-right: 20px;
      }

      &-current {
        color: extract(@colors, 3);
      }
    }
  }
}

.turn-page {
  &__before {
    margin-right: 20px;
    font-size: 15px;
  }

  &__after {
    font-size: 15px;
  }

  &--disabled {
    cursor: not-allowed;
    color: @disableText;
  }

  &__symbol {
    margin-right: 20px;
  }
}

a.turn-symbol {
  vertical-align: middle;

  &:hover {
    .symbol {
      &-ellipsis {
        display: none;
      }

      &-doubleArrow {
        display: block;
      }
    }
  }
}
.symbol {
  &-ellipsis {
    color: extract(@colors, 1);
    display: block;
  }

  &-doubleArrow {
    display: none;
    color: extract(@colors, 3);
  }
}
</style>