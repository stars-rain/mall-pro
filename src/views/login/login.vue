<template>
  <n-form
    ref="form"
    label-placement="left"
    :model="formValue"
    :label-width="80"
    :rules="rules"
  >
    <n-form-item
      v-if="title === 'register'"
      label="用户名"
      path="user.userName"
    >
      <n-input
        ref="userName"
        :disabled="loading"
        @keypress.enter.prevent="focus('userAccount')"
        class="login-input"
        placeholder="请输入用户名"
        clearable
        :maxlength="8"
        :value="formValue.user.userName.trim()"
        @input="formValue.user.userName = $event"
      />
      <svg-icon popper-class="input-icon" icon-class="name"></svg-icon>
    </n-form-item>
    <n-form-item label="账号" path="user.account">
      <n-input
        ref="userAccount"
        :disabled="loading"
        @keypress.enter.prevent="focus('userPassword')"
        class="login-input"
        :maxlength="8"
        clearable
        v-model:value="formValue.user.account"
        placeholder="请输入账号"
      />
      <svg-icon popper-class="input-icon" icon-class="user"></svg-icon>
    </n-form-item>
    <n-form-item label="密码" path="user.password">
      <n-input
        ref="userPassword"
        :disabled="loading"
        @input="handlePasswordInput"
        @keypress.enter.prevent="focus('userRepeatPassword')"
        type="password"
        class="login-input"
        show-password-on="click"
        placeholder="请输入密码"
        v-model:value="formValue.user.password"
        clearable
        :maxlength="8"
      />
      <svg-icon popper-class="input-icon" icon-class="lock"></svg-icon>
    </n-form-item>
    <n-form-item
      ref="userRepeatPasswordItem"
      v-if="title === 'register'"
      first
      path="user.repeatPassword"
      label="重复密码"
    >
      <n-input
        ref="userRepeatPassword"
        class="login-input"
        :disabled="!formValue.user.password || loading"
        v-model:value="formValue.user.repeatPassword"
        type="password"
        placeholder="请重复输入密码"
        show-password-on="click"
        clearable
        :maxlength="8"
        @keyup.enter.prevent="toValidate" /><svg-icon
        popper-class="input-icon"
        icon-class="locked"
      ></svg-icon
    ></n-form-item>
    <n-form-item>
      <n-button
        class="login-button login-button__left"
        :disabled="loading"
        @click="redirect"
        attr-type="button"
        size="large"
        >取消</n-button
      >
      <n-button
        :loading="loading"
        class="login-button login-button__right"
        type="info"
        size="large"
        attr-type="button"
        @click="toValidate"
        >{{ !loading ? `${currentTitle}` : `${currentTitle}中` }}</n-button
      >
    </n-form-item>
  </n-form>
  <span
    v-if="title === 'register'"
    :class="{ isAccount: true, isLoading: loading }"
    @click="jump(title)"
    >已有账号？</span
  >
  <span
    v-if="title === 'login'"
    :class="{ isAccount: true, isLoading: loading }"
    @click="jump(title)"
    >没有账号？</span
  >
</template>

<script lang="ts">
import {
  defineComponent,
  defineProps,
  ref,
  watchEffect,
  reactive,
  computed,
  withDefaults,
  defineEmits,
  nextTick,
} from "@vue/runtime-core";

export default defineComponent({
  name: "login",
  methods: {
    // 重定向到商城首页
    redirect(): void {
      this.$router.go(-1);
    },
    // 当路由改变时将表单的检验还原到未检验的状态(主要作用是暴露给父组件使用)
    restoreValidation(): void {
      (this.$refs.form as any).restoreValidation();
    },
  },
});
</script>

<script lang="ts" setup>
import type {
  NInput,
  NFormItem,
  NForm,
  FormItemRule,
  FormRules,
} from "naive-ui";
import { Base64 } from "js-base64";
import { $axios } from "../../plugins/axios";
import { useMessage } from "naive-ui";
import { useRouter } from "vue-router";
import Cookie from "@/plugins/cookie";
import { useMutations } from "@/vuexHooks";

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
const router = useRouter();
/**
 * naive ui的信息提示API
 */
const $message = useMessage();
const props = withDefaults(
  defineProps<{
    /**
     * 用户需要登录还是注册
     */
    title: string;
    /**
     * 用户点击注册或登录按钮时显示'注册中'或'登录中'
     */
    loading: boolean;
  }>(),
  {
    loading: false,
  }
);

const emits = defineEmits<{
  (e: "update:loading", loading: boolean): void;
}>();

/**
 * 注册或登录按钮的文字
 */
const currentTitle = computed(() =>
  props.title === "login" ? "登录" : "注册"
);

/**
 * 表单元素form元素动态绑定一个model值为formValue
 */
// eslint-disable-next-line no-undef
let formValue = reactive<{ user: User }>({
  user: {
    userName: "", // 用户昵称
    account: "", // 用户账号
    password: "", // 用户密码
    repeatPassword: "", // 重复密码
  },
});
/**
 * 给表单form添加一个ref属性
 */
let form = ref<InstanceType<typeof NForm>>();
/**
 * 给用户名输入框添加一个ref属性
 */
let userName = ref<InstanceType<typeof NInput>>();
/**
 * 给用户账号输入框添加一个ref属性
 */
let userAccount = ref<InstanceType<typeof NInput>>();
/**
 * 给用户密码输入框添加一个ref属性
 */
let userPassword = ref<InstanceType<typeof NInput>>();
/**
 * 给用户重复密码输入框添加一个ref属性
 */
let userRepeatPassword = ref<InstanceType<typeof NInput>>();
/**
 * 给用户重复密码输入框的父组件n-form-item添加一个ref属性
 */
let userRepeatPasswordItem = ref<InstanceType<typeof NFormItem>>();

/**
 * 清空表单数据
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const clearFormValue = (): void => {
  formValue.user = {
    userName: "",
    account: "",
    password: "",
    repeatPassword: "",
  };
};

/**
 * 登录和注册页面的切换
 * @param title - 用户当前需要注册还是登录
 */
const jump: (title: string) => void = (title: string): void => {
  if (props.loading) return; // 如果正在登录或注册时直接退出函数
  clearFormValue(); // 清空表单信息
  form.value?.restoreValidation(); // 当路由改变时将表单的检验还原到未检验的状态
  router.replace({
    name: "reglog",
    params: { title: title === "login" ? "register" : "login" },
  });
  document.title = title === "login" ? "注册" : "登录";
};

watchEffect(() => {
  if (props.title === "login") {
    userAccount.value?.focus(); // 如果用户需要登录的话则用户账号输入框聚焦
  } else if (props.title === "register") {
    userName.value?.focus(); // 如果用户需要登录的话则用户名输入框聚焦
  }
});

/**
 * 提交表单时进行验证
 * @param title - 用户是登录还是注册
 */
const validateForm: (title: string) => void = (title: string): void => {
  form.value?.validate((errors) => {
    if (errors) return;
    emits("update:loading", true); // 开始加载动画
    switch (title) {
      case "login": {
        // 执行登录操作
        // eslint-disable-next-line no-undef
        const user: Omit<User, "userName" | "repeatPassword"> = {
          account: Base64.encode(formValue.user.account.trim()),
          password: Base64.encode(formValue.user.password.trim()),
        };
        $axios([
          "/login",
          "post",
          { params: Base64.encode(JSON.stringify(user)) },
        ])
          .then((res) => {
            setTimeout(() => {
              emits("update:loading", false); // 关闭动画
              if (res.data.status === "success") {
                const usr = JSON.parse(Base64.decode(res.data.messages.user));
                // 保存用户账号到cookie中
                Cookie.setCookie({ account: user.account }, 0.5);
                Promise.all([
                  handleToAccount({ account: formValue.user.account.trim() }),
                  handleToUserName({ name: usr.userName }),
                  handleToLogin({ isLogin: true }),
                  usr.avatarSrc ? handleToAvatar({ src: usr.avatarSrc }) : null,
                  usr.name ? handleToName({ name: usr.name }) : null,
                  usr.telephone
                    ? handleToTelephone({
                        telephone: usr.telephone,
                      })
                    : null,
                  usr.address
                    ? handleToAddress({
                        address: usr.address,
                      })
                    : null,
                ])
                  .then(() => {
                    if (router.currentRoute.value.name === "reglog")
                      router.go(-1);
                  })
                  .catch((error) => console.log(error));
              } else if (res.data.status === "error") {
                // 登录验证失败则账号输入框聚焦
                nextTick(() => userAccount.value?.focus());
                $message.error(res.data.reason);
              }
            }, 1000);
          })
          .catch((error) => {
            console.log(error);
            emits("update:loading", false); // 关闭动画
            $message.error("登录失败，尝试再登录一次");
            // 登录失败则账号输入框聚焦
            nextTick(() => userAccount.value?.focus());
          });
        break;
      }
      case "register": {
        // 执行注册操作
        // eslint-disable-next-line no-undef
        const user: Omit<User, "repeatPassword"> = {
          userName: Base64.encode(formValue.user.userName.trim()),
          account: Base64.encode(formValue.user.account.trim()),
          password: Base64.encode(formValue.user.password.trim()),
        };
        $axios([
          "/register",
          "post",
          { params: Base64.encode(JSON.stringify(user)) },
        ])
          .then((res) => {
            setTimeout(() => {
              emits("update:loading", false); // 关闭动画
              if (res.data.status === "success") {
                $message.success("注册成功");
                nextTick(() => {
                  jump("register"); // 跳转到登录页面
                });
              } else if (res.data.status === "error") {
                // 返回的错误信息
                const mess: string = res.data.reason;
                if (mess === "账号已存在")
                  nextTick(() => userAccount.value?.focus());
                else nextTick(() => userName.value?.focus());
                $message.error(mess);
              }
            }, 1000);
          })
          .catch((error) => {
            console.log(error);
            emits("update:loading", false); // 关闭动画
            $message.error("注册失败，尝试再注册一次");
            // 注册失败则用户名输入框聚焦
            nextTick(() => userName.value?.focus());
          });
        break;
      }
    }
  });
};
/**
 * 当用户完成表单输入进行注册或登录
 */
const toValidate: () => void = async (): Promise<void> => {
  if (props.loading) return; // 如果正在登录或注册时直接退出函数
  validateForm(props.title);
};

// 输入框聚焦逻辑
const focus = (property: string): void => {
  switch (property) {
    case "userAccount":
      userAccount.value?.focus();
      break;
    case "userPassword":
      userPassword.value?.focus();
      break;
    case "userRepeatPassword":
      if (props.title === "register" && formValue.user.password) {
        userRepeatPassword.value?.focus();
      } else if (props.title === "login") {
        toValidate();
      }
      break;
  }
};

/**
 * 当用户输入了重复密码再次去修改密码时后的触发该验证操作
 */
const handlePasswordInput = () => {
  if (formValue.user.repeatPassword) {
    userRepeatPasswordItem.value?.validate({ trigger: "password-input" });
  }
};

/**
 * 昵称输入框、密码输入框以及重复密码输入框的验证
 * @param title - 判断是哪种输入框的验证
 * @param count - 账号和密码的总位数
 * @param validatePasswordStartWith - 当用户输入了重复密码再次去修改密码时的操作
 * @return 返回错误类型或者true
 */
const validateInput: (
  title: string,
  count?: number,
  validatePasswordStartWith?: string
) => (rules: FormItemRule, value: string) => boolean | Error =
  (
    title: string,
    count?: number,
    validatePasswordStartWith?: string
  ): ((rules: FormItemRule, value: string) => boolean | Error) =>
  (rules: FormItemRule, value: string): boolean | Error => {
    value = value.trim();
    if (!value && title !== "重复密码") return new Error(`${title}不能为空`);
    else if (!value.match(/^[a-zA-Z0-9_\\.]{1,}$/g) && title !== "用户名")
      return new Error(`${title}只能由字母、数字、小数点和下划线组成`);
    else if (
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      value.length < count! &&
      validatePasswordStartWith !== "validatePassword"
    )
      return new Error(`${title}不能少于${count}个字符`);
    else if (
      validatePasswordStartWith === "validatePassword" &&
      formValue.user.password &&
      !formValue.user.password.startsWith(value)
    )
      return new Error("两次密码输入不一致");
    else if (
      title === "重复密码" &&
      value !== formValue.user.password &&
      validatePasswordStartWith !== "validatePassword"
    )
      return new Error("两次密码输入不一致");
    return true;
  };
// 表单各项的验证规则
const rules: FormRules | any = {
  user: {
    userName: {
      required: true,
      trigger: "blur",
      validator: validateInput("用户名"),
    },
    account: {
      required: true,
      trigger: ["blur", "input"],
      validator: validateInput("账号", 8),
    },
    password: {
      required: true,
      trigger: ["blur", "input"],
      validator: validateInput("密码", 8),
    },
    repeatPassword: [
      {
        required: true,
        message: "请再次输入密码",
        trigger: ["input", "blur"],
      },
      {
        validator: validateInput("重复密码", 8, "validatePassword"), // 当用户输入重复密码时触发的验证
        trigger: "input",
      },
      {
        required: true,
        validator: validateInput("重复密码"), // 当用户输入了重复密码再次去修改密码时后的触发的验证
        trigger: ["blur", "password-input"],
      },
    ],
  },
};
</script>

<style lang="less" scoped>
.isAccount {
  float: right;
  margin-top: 15px;
  cursor: pointer;
  color: #2080f0;
  transition: color 0.2s;

  &:hover {
    color: #4098fc;
  }
}
.isLoading {
  color: rgb(157, 157, 163) !important;
  cursor: not-allowed !important;
}
.input-icon {
  position: absolute;
  left: 0;
  color: #c0c4cc;
  width: 30px;
}
.login {
  &-input {
    padding-left: 17px;
  }

  &-button {
    position: absolute;
    top: 10px;
    bottom: 0;

    &__left {
      left: 60px;
    }

    &__right {
      right: 10px;
    }
  }
}
</style>