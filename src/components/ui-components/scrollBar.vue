<template>
  <div
    id="scrollBox"
    class="scroll-box"
    @mouseenter="handleToshowThumb(true)"
    @mouseleave="handleToshowThumb(false)"
  >
    <div ref="scrollContent" class="scroll-content">
      <slot></slot>
    </div>
    <!-- 在用户未禁用滚动条且主内容高度大于盒子的最大高度时才显示滚动条 -->
    <div class="scroll-track" v-if="!disabled && contentHei > currentMaxHei">
      <transition name="scroll-fade">
        <div
          v-show="showThumb"
          v-scroll="{ handleToshowThumb, maxHei, ele: 'scrollBox', dropDown }"
          class="scroll-thumb"
        ></div
      ></transition>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  toRefs,
  onBeforeUnmount,
  watch,
} from "@vue/runtime-core";
import scroll from "@/directives/scroll";

export default defineComponent({
  name: "scrollBar",
  props: {
    // 根元素的最大宽度
    maxHei: {
      type: String,
      default: "120px",
    },
    // 根元素的宽度
    width: {
      type: String,
      default: "250px",
    },
    // 需要滚动的元素主内容的高度
    contentHei: {
      type: Number,
      default: 0,
    },
    // 是否需要禁用滚动条
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  directives: {
    scroll,
  },
  data() {
    return {
      showThumb: false, // 是否显示滚动条
    };
  },
  methods: {
    // 改变滚动条的显示状态
    handleToshowThumb(show: boolean): void {
      // 如果用户点击滚动条进行下滑时不隐藏滚动条
      if (
        !show &&
        (document.onmousemove?.name === "r" ||
          document.onmousemove?.name === "dropDown")
      )
        return;
      this.showThumb = show;
    },
  },
  setup(props) {
    const { maxHei, contentHei, disabled } = toRefs(props);
    let currentMaxHei = ref<number>(+maxHei.value.replace("px", ""));

    /**
     * 给根元素一个ref属性
     */
    let scrollContent = ref<HTMLDivElement>();
    /**
     * 滚动条的高度
     */
    let scrollThumbHei = ref<string>("");
    /**
     * 滚动条距离轨道顶部的实际距离
     */
    let top = ref<string>("0px");

    /**
     * 鼠标下滑时滚动元素
     */
    const scrollTo: () => void = (): void => {
      top.value =
        ((scrollContent.value?.scrollTop as number) /
          (scrollContent.value as HTMLDivElement).scrollHeight) *
          currentMaxHei.value +
        "px";
    };
    /**
     * 下拉或上拉滚动条时滚动元素
     * @param distY - 下拉或上拉完后滚动条应距离滚动轨道顶部的距离
     */
    const dropDown: (distY: number) => void = (distY: number): void => {
      top.value = distY + "px";
      (scrollContent.value as HTMLDivElement).scrollTop =
        (distY / currentMaxHei.value) *
        (scrollContent.value as HTMLDivElement).scrollHeight;
    };

    onMounted(() => {
      // 如果无滚动条的话直接退出
      if (disabled.value) return;
      // 根元素的本身高度
      const scrollBarHei =
        contentHei.value ||
        (scrollContent.value as HTMLDivElement).scrollHeight;
      scrollThumbHei.value =
        (currentMaxHei.value / scrollBarHei) * currentMaxHei.value + "px";
      scrollContent.value?.addEventListener("scroll", scrollTo);
    });

    watch(
      (): number => contentHei.value,
      (newValue: number): void => {
        // 根元素的本身高度
        const scrollBarHei = newValue;
        scrollThumbHei.value =
          (currentMaxHei.value / scrollBarHei) * currentMaxHei.value + "px";
      }
    );

    onBeforeUnmount(() => {
      // 如果无滚动条的话直接退出
      if (disabled.value) return;
      scrollContent.value?.removeEventListener("scroll", scrollTo);
    });

    return {
      scrollContent,
      scrollThumbHei,
      scrollTo,
      top,
      dropDown,
      currentMaxHei,
    };
  },
});
</script>

<style lang="less" scoped>
.scroll {
  &-box {
    width: v-bind(width);
    position: relative;
    .noselect();
    max-height: v-bind(maxHei);
    overflow: hidden;
  }

  &-fade {
    &-enter-from,
    &-leave-to {
      opacity: 0;
    }
  }

  &-content {
    width: calc(100% - 10px);
    max-height: v-bind(maxHei);
    overflow: scroll;

    &::-webkit-scrollbar,
    &::-webkit-scrollbar-track-piece,
    &::-webkit-scrollbar-thumb {
      width: 0;
      height: 0;
      display: none;
    }
  }

  &-track {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 10px;
  }

  &-thumb {
    position: relative;
    top: v-bind(top);
    height: v-bind(scrollThumbHei);
    border-radius: 10px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background-color: rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: background-color 0.2s, opacity 0.15s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.315);
    }
  }
}
</style>