<template>
  <teleport to="body">
    <template v-if="showDialogBox">
      <transition name="dialog-fade">
        <div
          v-show="showDialog"
          ref="mask"
          :class="{ 'mask-layer': true, isMask: maskable }"
        >
          <div class="dialog-box flex">
            <transition name="dialog-content">
              <div
                ref="dialog"
                v-dialogDrag="{ draggable, focus, }"
                v-show="showDialog"
                class="dialog"
              >
                <div :class="{ 'dialog-header': true, draggle: draggable }">
                  <span v-if="title" class="dialog-header__title">
                    <svg-icon
                      popper-class="icon-notify"
                      :icon-class="titleType"
                      v-if="showIcon"
                    ></svg-icon>

                    {{ title }}</span
                  >
                  <svg-icon
                    popper-class="dialog-header__close dialog-close"
                    icon-class="close"
                    @click="closeDialog"
                  ></svg-icon>
                </div>
                <div v-if="dividerable" class="dialog-header__divider"></div>
                <slot></slot>
                <div class="dialog-footer">
                  <slot name="footer"></slot>
                </div></div
            ></transition>
          </div></div></transition
    ></template>
  </teleport>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onBeforeUnmount,
  watch,
  toRefs,
  nextTick,
} from "@vue/runtime-core";
import SvgIcon from "../svgIcon/index.vue";
import dialogDrag from "@/directives/dialogDrag";
import { getScrollHei } from "@/plugins/getScrollHei"

export default defineComponent({
  name: "my-dialog",
  props: {
    // 是否可以通过点击关闭图标而关闭对话框
    close: {
      type: Boolean,
      default: true,
    },
    // 是否显示对话框
    modelValue: {
      type: Boolean,
      default: false,
    },
    // 对话框的标题
    title: {
      type: String,
      default: "",
    },
    // 对话框的标题类型
    titleType: {
      type: String,
      default: "notify",
    },
    // 是否是需要遮罩层
    maskable: {
      type: Boolean,
      default: true,
    },
    // 是否头部显示图标
    showIcon: {
      type: Boolean,
      default: true,
    },
    // 是否需要标题分割线
    dividerable: {
      type: Boolean,
      defualt: false,
    },
    // 对话框是否可以拖动
    draggable: {
      type: Boolean,
      default: false,
    },
    // 是否点击遮罩层可以关闭对话框
    maskClosable: {
      type: Boolean,
      default: true,
    },
  },
  emits: {
    ["update:modelValue"]<T>(show: T): boolean {
      return typeof show === "boolean";
    },
    moveFocus(): boolean {
      return true
    },
  },
  directives: {
    dialogDrag,
  },
  setup(props, { emit }) {
    /**
     * 是否渲染此组件
     */
    let showDialogBox = ref<boolean>(false);
    /**
     * 是否显示对话框(来自父组件)
     */
    let { modelValue, maskClosable, close } = toRefs(props);
    /**
     * 当前是否显示对话框(自身组件单独维护)
     */
    let showDialog = ref<boolean>(false);
    /**
     * 给遮罩层元素一个ref属性
     */
    let mask = ref<HTMLDivElement>();
    /**
     * 给对话框元素一个ref属性
     */
    let dialog = ref<HTMLDivElement>();

    const isInDialog: () => void = (ev?: MouseEvent): void => {
      // 被点击的元素是在对话框里面或者是点击对话框中密码输入框的显示密码的图标则直接返回
      if (
        dialog.value?.contains(ev?.target as HTMLElement) ||
        (ev?.target as HTMLElement).tagName === "svg" ||
        (ev?.target as HTMLElement).tagName === "path"
      )
        return;
      // 告诉父组件对话框准备关闭
      emit("update:modelValue", false);
    };

    /**
     * 增加click事件监听
     */
    const addClickEvent: () => void = (): void => {
      mask.value?.addEventListener("click", isInDialog);
    };
    /**
     * 移除click事件监听
     */
    const removeClickEvent: () => void = (): void => {
      mask.value?.removeEventListener("click", isInDialog);
    };

    watch(
      (): boolean => modelValue.value,
      (value: boolean): void => {
        if (value) {
          // 开始渲染此组件
          showDialogBox.value = true;
          document.body.style.cssText += `overflow: hidden;padding-right: ${
            getScrollHei()
          }px`;
          nextTick(() => {
            showDialog.value = true;
            // 给遮罩层元素监听鼠标点击事件(如果点击遮罩层可以关闭对话框)
            if (maskClosable.value) addClickEvent();
          });
        } else {
          document.body.style.cssText = "";
          // 关闭当前对话框
          showDialog.value = false;
          setTimeout(() => (showDialogBox.value = false), 450);
        }
      }
    );

    watch(
      (): boolean => close.value,
      (value: boolean): void => {
        // 如果此时正在显示加载动画时移除对话框的click事件监听
        if (!value && maskClosable.value) removeClickEvent();
        // 否则增加事件监听
        else addClickEvent();
      }
    );

    /**
     * 点击关闭图标从而关闭对话框
     */
    const closeDialog: () => void = (): void => {
      if (!close.value) return;
      emit("update:modelValue", false);
    };

    /**
     * 内部是否有文本框需要聚焦
     */
    const focus: () => void = (): void => {
      emit('moveFocus');
    }

    onBeforeUnmount(() => {
      if (maskClosable.value) removeClickEvent();
    });

    return {
      dialog,
      showDialog,
      showDialogBox,
      mask,
      closeDialog,
      focus,
    };
  },
  components: { SvgIcon },
});
</script>

<style lang="less" scoped>
.draggle {
  cursor: move;
}
.isMask {
  background-color: #00000080;
}
.mask-layer {
  position: fixed;
  z-index: 5555;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  overflow: auto;
}
.dialog {
  &-box {
    min-height: 450px;
    .setWidHei(100%, 100%);
    overflow: auto;
  }

  &-fade-enter-active,
  &-fade-leave-active {
    transition: opacity 0.4s ease-in-out;
  }

  &-fade-enter-from,
  &-fade-leave-to {
    opacity: 0;
  }

  &-content-enter-active,
  &-content-leave-active {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  &-content-enter-from,
  &-content-leave-to {
    transform: scale(0);
  }

  position: absolute;
  width: 420px;
  background-color: extract(@colors, 4);
  border-radius: 2px;
  transition: background-color 0.5s;
  min-height: 150px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  &-header {
    position: relative;
    padding: 10px 0 10px 30px;

    &__divider {
      .setWidHei(100%, 1px);
      background-image: linear-gradient(
        to right,
        rgba(255, 0, 0, 0),
        #c2bebecb,
        rgba(255, 0, 0, 0)
      );
    }

    &__title {
      font-size: 17px;
      color: extract(@colors, 1);
      .noselect();

      .icon-notify {
        margin-right: 5px;
        vertical-align: middle;
        color: #4098fc;
        font-size: 25px;
      }
    }

    &__close {
      position: absolute;
      right: 10px;
      top: 8px;
    }
  }

  &-footer {
    text-align: right;
    margin: 20px 20px 20px 0;
    :slotted(button) {
      margin-right: 30px;
    }
  }
}
</style>