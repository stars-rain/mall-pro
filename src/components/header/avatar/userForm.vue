<template>
  <n-form
    class="dialog-form"
    ref="Form"
    label-placement="left"
    :model="form"
    :label-width="opeartionType === '修改密码' ? 80 : 70"
    :rules="rules"
  >
    <n-form-item
      path="username"
      v-if="opeartionType === '修改用户名'"
      label="新用户名"
    >
      <n-input
        ref="user_nameRef"
        class="dialog-input"
        placeholder="请输入新用户名"
        :disabled="loading"
        clearable
        :maxlength="8"
        @keypress.enter.prevent="submit(opeartionType)"
        :value="form.username.trim()"
        @input="form.username = $event"
      >
        <template #prefix>
          <svg-icon
            popper-class="user-mess--input__icon"
            icon-class="name"
          ></svg-icon></template></n-input></n-form-item
    ><n-form-item
      path="name"
      v-if="opeartionType === '设置收货信息'"
      label="真实姓名"
    >
      <n-input
        ref="nameRef"
        :disabled="loading"
        class="dialog-input"
        placeholder="请输入真实姓名"
        @keypress.enter.prevent="inputFocus('telephoneRef')"
        clearable
        :value="form.name.trim()"
        @input="form.name = $event"
      >
        <template #prefix>
          <svg-icon
            popper-class="user-mess--input__icon"
            icon-class="user"
          ></svg-icon></template></n-input></n-form-item
    ><n-form-item
      path="telephone"
      v-if="opeartionType === '设置收货信息'"
      label="手机号码"
    >
      <n-input
        ref="telephoneRef"
        :disabled="loading"
        class="dialog-input"
        placeholder="请输入手机号码"
        @keypress.enter.prevent="inputFocus('adressRef')"
        clearable
        :maxlength="11"
        v-model:value="form.telephone"
      >
        <template #prefix>
          <svg-icon
            popper-class="user-mess--input__icon"
            icon-class="telephone"
          ></svg-icon></template></n-input
    ></n-form-item>
    <n-form-item
      path="address"
      v-if="opeartionType === '设置收货信息'"
      label="收货地址"
    >
      <n-input
        ref="adressRef"
        :disabled="loading"
        type="textarea"
        size="small"
        :autosize="{
          minRows: 2,
        }"
        class="dialog-input"
        placeholder="请输入收货地址"
        :maxlength="40"
        @keypress.enter.prevent="submit(opeartionType)"
        :value="form.address.trim()"
        @input="form.address = $event"
      />
    </n-form-item>
    <n-form-item
      v-if="opeartionType === '验证密码'"
      label="验证密码"
      path="validatePassword"
    >
      <n-input
        ref="validatePasswordRef"
        :disabled="loading"
        type="password"
        class="dialog-input"
        show-password-on="click"
        placeholder="请输入原密码"
        @keypress.enter.prevent="submit(opeartionType)"
        v-model:value="form.validatePassword"
        clearable
        :maxlength="8"
      >
        <template #prefix>
          <svg-icon
            popper-class="user-mess--input__icon"
            icon-class="lock"
          ></svg-icon></template
      ></n-input>
    </n-form-item>
    <n-form-item
      v-if="opeartionType === '修改密码'"
      label="新密码"
      path="password"
    >
      <n-input
        ref="passwordRef"
        :disabled="loading"
        @input="handlePasswordInput"
        @keypress.enter.prevent="inputFocus('confirmPasswordRef')"
        type="password"
        class="dialog-input"
        show-password-on="click"
        placeholder="请输入新密码"
        v-model:value="form.password"
        clearable
        :maxlength="8"
      >
        <template #prefix>
          <svg-icon
            popper-class="user-mess--input__icon"
            icon-class="lock"
          ></svg-icon></template
      ></n-input>
    </n-form-item>
    <n-form-item
      ref="confirmPasswordItem"
      v-if="opeartionType === '修改密码'"
      first
      path="confirmPassword"
      label="确认密码"
    >
      <n-input
        ref="confirmPasswordRef"
        :disabled="!form.password || loading"
        class="dialog-input"
        @keypress.enter.prevent="submit(opeartionType)"
        v-model:value="form.confirmPassword"
        type="password"
        placeholder="请重复输入密码"
        show-password-on="click"
        clearable
        :maxlength="8"
        ><template #prefix
          ><svg-icon
            popper-class="user-mess--input__icon"
            icon-class="locked"
          ></svg-icon></template></n-input
    ></n-form-item>
  </n-form>
  <div class="address-length" v-if="opeartionType === '设置收货信息'">
    <span>{{ form.address.trim().length }}/40</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  withDefaults,
  defineProps,
  onMounted,
  defineEmits,
  onBeforeUnmount,
} from "@vue/runtime-core";
import type {
  NInput,
  NForm,
  FormRules,
  FormItemRule,
  NFormItem,
} from "naive-ui";

export default defineComponent({
  name: "user-form",
  methods: {
    /**
     * 输入框聚焦
     * @param inputStr - 哪种输入框
     */
    inputFocus(inputStr: string): void {
      (this.$refs[inputStr] as typeof NInput).focus();
    },
  },
});
</script>

<script lang="ts" setup>
import { useMessage } from "naive-ui";
import { useState, useMutations } from "@/vuexHooks";
import { $axios } from "@/plugins/axios";
import { Base64 } from "js-base64";

const props = withDefaults(
  defineProps<{
    opeartionType: string; // 用户操作类型(是修改用户名还是设置收货信息)
    loading?: boolean; // 是否显示确认按钮的加载动画
    showDialog?: boolean; // 是否显示对话框
  }>(),
  {
    loading: false,
    showDialog: false,
  }
);
const emits = defineEmits<{
  (ev: "update:loading", loading: boolean): void;
  (ev: "update:opeartionType", type: string): void;
  (ev: "update:showDialog", showDialog: boolean): void;
}>();

const { userName, name, telephone, address, account } = useState(
  ["userName", "name", "telephone", "address", "account"],
  "UserModule"
);
const { handleToUserName, handleToName, handleToTelephone, handleToAddress } =
  useMutations(
    [
      "handleToUserName",
      "handleToName",
      "handleToTelephone",
      "handleToAddress",
    ],
    "UserModule"
  );
const $message = useMessage();

/**
 * 用户信息接口
 */
interface User {
  username: string; // 用户名
  telephone: string; // 用户电话
  name: string; // 用户的真实姓名
  address: string; // 用户地址
  validatePassword: string; // 验证密码(验证成功再修改密码)
  password: string; // 用户密码
  confirmPassword: string; // 重复密码
}
/**
 * 用户所有信息集合(用于绑定到表单)
 */
let form = reactive<User>({
  username: userName.value,
  telephone: name.value,
  name: telephone.value,
  address: address.value,
  validatePassword: "",
  password: "",
  confirmPassword: "",
});

let confirmPasswordItem = ref<InstanceType<typeof NFormItem>>();

/**
 * 当用户输入了重复密码再次去修改密码时后的触发该验证操作
 */
const handlePasswordInput = () => {
  if (form.confirmPassword) {
    confirmPasswordItem.value?.validate({ trigger: "password-input" });
  }
};

/**
 * 修改用户名，设置真实姓名、电话以及地址输入框的验证
 * @param title - 判断是哪种输入框的验证
 * @param count - 有些输入框的总位数
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
    if (!value && title !== "重复密码") return new Error(`${title}不能为空`);
    else if (!value.match(/^1/g) && title === "手机号码")
      return new Error(`${title}只能以1开头`);
    else if (/[^0-9]/g.test(value) && title === "手机号码")
      return new Error(`${title}只能由数字组成`);
    else if (
      !value.match(/^[a-zA-Z0-9_\\.]{1,}$/g) &&
      (title === "密码" || "重复密码" || "验证密码")
    )
      return new Error(`${title}只能由字母、数字、小数点和下划线组成`);
    else if (
      value.length < (count as number) &&
      validatePasswordStartWith !== "validatePassword"
    )
      return new Error(`${title}不能少于${count}位`);
    else if (
      validatePasswordStartWith === "validatePassword" &&
      form.password &&
      !form.password.startsWith(value)
    )
      return new Error("两次密码输入不一致");
    else if (
      title === "重复密码" &&
      value !== form.password &&
      validatePasswordStartWith !== "validatePassword"
    )
      return new Error("两次密码输入不一致");
    return true;
  };
// 表单各项的验证规则
const rules: FormRules | any = {
  username: {
    required: true,
    trigger: "blur",
    message: "用户名不能为空",
  },
  name: {
    required: true,
    trigger: "blur",
    message: "姓名不能为空",
  },
  telephone: {
    required: true,
    trigger: ["blur", "input"],
    validator: validateInput("手机号码", 11),
  },
  address: {
    required: true,
    trigger: "blur",
    message: "收获地址不能为空",
  },
  validatePassword: {
    required: true,
    trigger: "blur",
    validator: validateInput("验证密码", 8),
  },
  password: {
    required: true,
    trigger: ["blur", "input"],
    validator: validateInput("密码", 8),
  },
  confirmPassword: [
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
};

/**
 * 给NForm表单一个ref属性
 */
let Form = ref<InstanceType<typeof NForm>>();
/**
 * 给修改用户名输入框一个ref属性
 */
let user_nameRef = ref<InstanceType<typeof NInput>>();
/**
 * 用来保存setTimeout函数
 */
let timing = ref<number>(0);
/**
 * 给用户真实姓名输入框一个ref属性
 */
let nameRef = ref<InstanceType<typeof NInput>>();
/**
 * 给用户密码输入框添加一个ref属性
 */
let passwordRef = ref<InstanceType<typeof NInput>>();
/**
 * 给验证密码输入框添加一个ref属性
 */
let validatePasswordRef = ref<InstanceType<typeof NInput>>();

/**
 * 修改操作对axios请求的一个封装
 * @param args - 元组类型，请求体的各项参数
 * @param successMess - 操作成功后的提示内容
 * @param errorMess - 操作失败后的提示内容
 */
const $http: <T>(
  args: [string, "post", T],
  successMess?: string,
  errorMess?: string
) => Promise<boolean> = <T extends { [key: string]: any }>(
  args: [string, "post", T],
  successMess?: string,
  errorMess?: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    $axios(args)
      .then((res) => {
        timing.value = setTimeout(() => {
          emits("update:loading", false); // 关闭加载动画
          if (res.data.status === "success") {
            if (typeof successMess === "string") $message.success(successMess); // 弹出成功操作后的提示内容
            resolve(true);
          } else {
            if (typeof errorMess === "string") $message.error(errorMess); // 弹出失败操作后的提示内容
            console.log(res.data.status);
            resolve(false);
          }
        }, 1500);
      })
      .catch((error) => console.log(error));
  });
};

/**
 * 确认修改用户信息(向后端发送请求)
 * @param type - 修改信息的类型
 */
const submit: (type: string) => void = (type: string): void => {
  if (props.loading) return; // 如果正在请求的话直接退出函数
  // 验证表单
  Form.value?.validate((errors) => {
    if (errors) return;
    emits("update:loading", true); // 开始加载动画
    switch (type) {
      case "修改用户名": {
        const usr = {
          account: Base64.encode(account),
          userName: Base64.encode(form.username),
        };
        $http(
          ["", "post", { params: Base64.encode(JSON.stringify(usr)) }],
          "修改成功",
          "修改失败"
        ).then((res: boolean): void => {
          if (res) {
            handleToUserName({ name: form.username }); // 通知vuex的UserModule修改用户名
            emits("update:showDialog", false); // 关闭对话框
          } else user_nameRef.value?.focus(); // 用户名输入框聚焦
        });
        break;
      }
      case "验证密码": {
        const usr = {
          account: Base64.encode(account),
          password: Base64.encode(form.validatePassword),
        };
        $http(
          ["", "post", { params: Base64.encode(JSON.stringify(usr)) }],
          "验证成功",
          "验证失败"
        ).then((res: boolean): void => {
          if (res) emits("update:opeartionType", "修改密码");
          else validatePasswordRef.value?.focus();
        });
        break;
      }
      case "修改密码": {
        const usr = {
          account: Base64.encode(account),
          password: Base64.encode(form.password),
        };
        $http(
          ["", "post", { params: Base64.encode(JSON.stringify(usr)) }],
          "修改成功",
          "修改失败"
        ).then((res: boolean): void => {
          if (res) emits("update:showDialog", false);
          else passwordRef.value?.focus(); // 用户名输入框聚焦
        });
        break;
      }
      case "设置收货信息": {
        const usr = {
          account: Base64.encode(account),
          name: Base64.encode(form.name),
          telephone: Base64.encode(form.telephone),
          address: Base64.encode(form.address),
        };
        $http(
          ["", "post", { params: Base64.encode(JSON.stringify(usr)) }],
          "设置成功",
          "设置失败"
        ).then((res: boolean): void => {
          if (res) {
            Promise.all([
              handleToName({ name: form.name }),
              handleToTelephone({ telephone: form.telephone }),
              handleToAddress({ address: form.address }),
            ])
              .then(() => {
                emits("update:showDialog", false);
              })
              .catch((error) => console.log(error));
          } else nameRef.value?.focus(); // 用户名输入框聚焦
        });
        break;
      }
    }
  });
};

onMounted(() => {
  timing.value = setTimeout(() => {
    // 每次打开对应对话框时实现相应的输入框聚焦
    switch (props.opeartionType) {
      case "修改用户名":
        user_nameRef.value?.focus();
        break;
      case "设置收货信息":
        nameRef.value?.focus();
        break;
      case "修改密码":
        passwordRef.value?.focus();
        break;
      case "验证密码":
        validatePasswordRef.value?.focus();
        break;
    }
  }, 400);
});

onBeforeUnmount(() => {
  if (timing.value) clearTimeout(timing.value);
});
</script>

<style lang="less" scoped>
.user-mess--input__icon {
  color: #c0c4cc;
}
.dialog {
  &-form {
    margin: 10px 0 -15px 30px;
  }
  &-input {
    width: 80%;
    margin-left: 5px;
  }
}

.address-length {
  width: 80%;
  margin: 0 auto;
  text-align: right;
  box-sizing: border-box;
  padding-right: 35px;
  font-size: 10px;
  color: #c0c4cc;
}
</style>