<template>
  <n-message-provider>
    <div class="header-avatar">
      <div class="upload-trigger">
        <avatar-upload ref="uploadAvatar" action="/saveImg">
          <n-avatar
            @click="isOpenMenu(true)"
            style="cursor: pointer"
            size="small"
            :title="userName"
            round
            :src="avatarSrc"
          ></n-avatar
        ></avatar-upload>
      </div>

      <span>在线</span>
      <transition name="fade">
        <ul
          v-show="showMenu"
          class="popover-avatarUpload"
          v-outClose="isOpenMenu"
        >
          <li
            v-for="item in userOperaMenu"
            :key="item.id"
            @click="handleToMenu(item.message)"
          >
            <svg-icon
              popper-class="user-message__icon"
              :icon-class="item.iconClass"
            ></svg-icon>
            {{ item.message }}
          </li>
        </ul></transition
      >
    </div>
    <my-dialog v-model="showDialog" :title="currentOpeartion" :close="!loading">
      <user-form
        ref="user_form"
        v-model:opeartion-type="currentOpeartion"
        v-model:loading="loading"
        v-model:show-dialog="showDialog"
      ></user-form>
      <template #footer>
        <n-button
          @click="showDialog = false"
          :disabled="loading"
          attr-type="button"
          size="medium"
          >取消</n-button
        >
        <n-button
          type="info"
          size="medium"
          attr-type="button"
          :loading="loading"
          @click="submit(currentOpeartion)"
          >{{ loading ? "确认中" : "确认" }}</n-button
        >
      </template>
    </my-dialog></n-message-provider
  >
</template>

<script lang="ts">
import { defineComponent, ref, PropType, nextTick } from "@vue/runtime-core";
import myDialog from "@/components/ui-components/myDialog.vue";
import avatarUpload from "./avatarUpload.vue";
import outClose from "@/directives/vueClickClose";
import type { UserOpearMenu } from "@/staticDatas/interface";
import userForm from "./userForm.vue";

export default defineComponent({
  name: "avatar-index",
  directives: {
    outClose,
  },
  props: {
    // 点击头像显示的对应菜单
    userOperaMenu: {
      type: Array as PropType<Array<UserOpearMenu>>,
      required: true,
    },
  },
  components: {
    myDialog,
    avatarUpload,
    userForm,
  },
});
</script>

<script lang="ts" setup>
import Cookie from "@/plugins/cookie";
import { useMessage } from "naive-ui";
import { useState, useMutations } from "@/vuexHooks";
import { $axios } from "@/plugins/axios";
import { useStore } from "@/store/index";

const store = useStore();
const { userName, avatarSrc } = useState(
  ["userName", "avatarSrc"],
  "UserModule"
);
const {
  handleToUserName,
  handleToLogin,
  handleToAvatar,
  handleToName,
  handleToTelephone,
  handleToAddress,
  handleToAccount,
} = useMutations(
  [
    "handleToUserName",
    "handleToLogin",
    "handleToAvatar",
    "handleToName",
    "handleToTelephone",
    "handleToAddress",
    "handleToAccount",
  ],
  "UserModule"
);
const message = useMessage();

/**
 * 点击用户头像是否显示对应的操作菜单
 */
let showMenu = ref<boolean>(false);
/**
 * 改变操作菜单的状态
 * @param isClose - 是否开启或者关闭操作菜单
 */
const isOpenMenu: (isClose: boolean) => void = (isClose: boolean): void => {
  if (isClose && showMenu.value) return;
  showMenu.value = isClose;
};
/**
 * 给avatarUpload组件一个ref属性
 */
let uploadAvatar = ref<InstanceType<typeof avatarUpload>>();

// 上传头像
const handleToUpload: () => void = (): void => {
  uploadAvatar.value?.upload(); // 通知avatarUpload开始上传头像
  isOpenMenu(false); // 关闭菜单
};

// 退出登录
const quitLogin: () => void = (): void => {
  isOpenMenu(false); // 关闭操作菜单
  $axios(["/logout", "patch", { isLogin: false }])
    .then((res) => {
      if (res.data.status === "success") {
        Cookie.deleteCookie(); // 删除Cookie
        store.commit("CartModule/$_clearCart"); // 清除vuex中的购物车数据
        if (store.state.CartModule.status !== 1)
          store.commit("CartModule/handleToStatus", { status: 1 }); // 改变购物车的状态为更改状态，用于下次登录会向后台请求购物车数据
        Promise.all([
          handleToUserName(), // 清除保存的用户名
          handleToAvatar(), // 将用户的头像路径改为默认路径
          handleToLogin(), // 改变用户的登录状态为未登录
          handleToName(), // 清除保存的用户的真实姓名
          handleToTelephone(), // 清除保存的用户的手机号码
          handleToAddress(), // 清除保存的用户的地址
          handleToAccount(), // 清除保存的用户账号
        ]).then(() => message.success("退出成功"));
      } else {
        message.error("退出失败");
        console.log(res.data.reason);
      }
    })
    .catch((error) => {
      message.error("退出失败");
      console.log(error);
    });
};

/**
 * 用户当前修改哪项信息的具体操作名称
 */
let currentOpeartion = ref<string>("");
/**
 * 是否显示对话框
 */
let showDialog = ref<boolean>(false);
/**
 * 修改用户名或者收货地址
 */
const opeartionUsrMess: (mess: string) => void = (mess: string): void => {
  currentOpeartion.value = mess; // 记录当前用户的操作(从而显示不同的输入框)
  showMenu.value = false; // 关闭操作菜单
  showDialog.value = true; // 打开对话框
};

// 操作点击头像显示的操作菜单
const handleToMenu: (message: string) => void = (message: string): void => {
  switch (message) {
    case "上传头像":
      handleToUpload();
      break;
    case "修改用户名":
      opeartionUsrMess("修改用户名");
      break;
    case "修改密码":
      opeartionUsrMess("验证密码");
      break;
    case "设置收货信息":
      opeartionUsrMess("设置收货信息");
      break;
    case "退出登录":
      quitLogin();
      break;
  }
};

/**
 * 是否显示确认按钮的加载动画
 */
let loading = ref<boolean>(false);

/**
 * 给user-form组件一个ref属性
 */
let user_form = ref<InstanceType<typeof userForm>>();

/**
 * 确认修改用户信息(向后端发送请求)
 * @param type - 修改信息的类型
 */
const submit: (type: string) => void = (type: string): void => {
  (user_form.value as any).submit(type);
};
</script>

<style lang="less" scoped>
.user-message__icon {
  font-size: 17px;
}
.fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.2s ease-in-out;
  }
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
.header {
  &-avatar {
    position: relative;
    float: right;
    margin-right: 30px;
    display: flex;
    align-items: center;
    height: 40px;

    :deep(.n-avatar img) {
      object-fit: cover !important;
      transform: translate3d(0, 0, 0);
    }

    .upload-trigger {
      .setWidHei(28px, 28px);
      border-radius: 50%;
      margin-right: 6px;
    }

    span {
      font-size: 12px;
      color: #ff3300;
    }

    .popover {
      &-avatarUpload {
        position: absolute;
        top: 7px;
        left: -160px;
        width: 150px;
        padding: 4px 3px 0;
        background-color: extract(@colors, 4);
        box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
          0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
        z-index: 120;

        & > li {
          padding: 3px 0px 3px 20px;
          display: block;
          margin-bottom: 2px;
          transition: background-color 0.2s;

          &:hover {
            background-color: @menuBgk;
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>