<template>
  <div style="height: 60px">
    <transition name="fade">
      <div v-show="showPrompt">
        <div class="delete-collect--box container clearfix">
          <div class="box-check--cancel">
            <svg-icon
              popper-class="check-cancel"
              icon-class="close"
              @click="emits('cancelChecked')"
            ></svg-icon>
            已选择 {{ currSelectIds.length }} {{ title }}
          </div>
          <div class="box-check--all">
            <div
              :class="{
                'check-collect--all': true,
                flex: true,
                isChecked: showSeleAll,
                noChecked: !showSeleAll,
              }"
              @click.prevent="selectAll"
            >
              <svg-icon
                popper-class="icon-checked"
                v-show="showSeleAll"
                icon-class="check"
              ></svg-icon>
            </div>
            全选
          </div>
          <div style="float: right">
            <button
              class="box-collect--deleteButt"
              @click="
                emits(
                  'openDailogDele',
                  `确认${title === '个订单' ? '删除' : '移除'}该${
                    currSelectIds.length
                  }${title}？`
                )
              "
            >
              {{ title === "个订单" ? "删除" : "移除" }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  withDefaults,
  defineEmits,
  defineProps,
  ref,
  watch,
} from "@vue/runtime-core";

export default defineComponent({
  name: "collect-delete-box",
});
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    showPrompt?: boolean; // 是否需要显示该组件
    selectIds: Array<number>; // 当前用户所选择的商品的id集合
    showSeleAll?: boolean; // 是否显示全选按钮样式
    title: string; // 提示语(如: 已选怎多少什么什么)
    // eslint-disable-next-line no-undef
    datas: Array<Collect> | Array<Order>;
  }>(),
  {
    showPrompt: false,
    showSeleAll: false,
  }
);

const emits = defineEmits<{
  (e: "update:showPrompt", show: boolean): void;
  (e: "update:selectIds", ids: Array<number>): void;
  (e: "update:showSeleAll", show: boolean): void;
  (e: "cancelChecked"): void; // 取消选中
  (e: "openDailogDele", mess: string, id?: number): void;
}>();

/**
 * 当前所勾选商品的id集合
 */
let currSelectIds = ref<Array<number>>([]);

watch(
  (): Array<number> => currSelectIds.value,
  (ids: Array<number>): void => {
    emits("update:selectIds", ids);
  },
  {
    deep: true,
  }
);
watch(
  (): Array<number> => props.selectIds,
  (ids: Array<number>): void => {
    currSelectIds.value = ids;
  },
  {
    deep: true,
  }
);

/**
 * 挑选全部商品
 */
const selectAll: () => void = (): void => {
  emits("update:showSeleAll", !props.showSeleAll);
  currSelectIds.value.splice(0);
  // 如果此时所有商品都被选中则取消选中
  if (props.showSeleAll) emits("update:showPrompt", false);
  else props.datas.forEach((item) => currSelectIds.value.push(item.id));
};
</script>

<style lang="less" scoped>
.delete-collect--box {
  height: 60px;
  line-height: 60px;
  padding: 0 29px;
  box-sizing: border-box;
  position: relative;
  color: extract(@colors, 1);
}

.check-collect--all {
  .setWidHei(20px, 20px);
  border-radius: 50%;
  transition: background-color 0.25s;
  margin-right: 10px;
  font-size: 17px;
}

.box {
  &-check--all {
    display: flex;
    align-items: center;
    float: left;
  }

  &-check--cancel {
    float: left;
    margin-right: 40px;
    .check-cancel {
      font-size: 22px;
      margin-right: 20px;
      vertical-align: middle;
      cursor: pointer;
      transition: color, 0.15s;

      &:hover {
        color: extract(@colors, 3);
      }
    }
  }

  &-collect--deleteButt {
    .setWidHei(60px, 30px);
    .submit(extract(@colors, 4), extract(@colors, 3),  #fff9f7);
    border: 1px solid #f5c8a9;
  }
}

.fade {
  .fade(0.2s, ease);
}
</style>