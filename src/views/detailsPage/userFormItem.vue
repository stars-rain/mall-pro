<template>
  <n-form
    class="dialog-form__item"
    ref="FormItem"
    label-placement="left"
    :model="form"
    :rules="rules"
    :label-width="opeartionType === '修改收货地址' ? 80 : 70"
  >
    <n-form-item
      path="name"
      v-if="opeartionType === '修改收货人姓名'"
      label="新收货人"
    >
      <n-input
        ref="receiptNameRef"
        class="dialog-input__item"
        placeholder="请输入新收货人姓名"
        :disabled="loading"
        clearable
        @keyup.enter.prevent="submit(opeartionType)"
        :value="form.name.trim()"
        @input="form.name = $event"
      >
        <template #prefix>
          <svg-icon
            popper-class="user-mess--input__icon"
            icon-class="receiver"
          ></svg-icon></template></n-input
    ></n-form-item>
    <n-form-item
      path="telephone"
      v-if="opeartionType === '修改手机号码'"
      label="新号码"
    >
      <n-input
        ref="telephoneItemRef"
        :disabled="loading"
        class="dialog-input__item"
        placeholder="请输入新手机号码"
        clearable
        v-model:value="form.telephone"
        @keyup.enter.prevent="submit(opeartionType)"
        :maxlength="11"
      >
        <template #prefix>
          <svg-icon
            popper-class="user-mess--input__icon"
            icon-class="cellPhone"
          ></svg-icon></template></n-input
    ></n-form-item>
    <n-form-item
      path="address"
      v-if="opeartionType === '修改收货地址'"
      label="新收货地址"
    >
      <n-input
        ref="addressItemRef"
        :disabled="loading"
        type="textarea"
        size="small"
        :autosize="{
          minRows: 2,
        }"
        class="dialog-input__item"
        placeholder="请输入新收货地址"
        :maxlength="40"
        @keyup.enter.prevent="submit(opeartionType)"
        :value="form.address.trim()"
        @input="form.address = $event"
      />
    </n-form-item>
  </n-form>
  <div class="address-length" v-if="opeartionType === '修改收货地址'">
    <span>{{ form.address.trim().length }}/40</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  withDefaults,
  defineProps,
  defineEmits,
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
} from "@vue/runtime-core";
import { useState, useMutations } from "@/vuexHooks";
import type {
  NInput,
  NForm,
  FormRules,
  FormItemRule,
} from "naive-ui";
import { Base64 } from "js-base64";
import { $axios } from "@/plugins/axios";
import { useMessage } from "naive-ui";

export default defineComponent({
  name: "user-form-item",
});
</script>

<script lang="ts" setup>
const $message = useMessage();
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
const { account, name, telephone, address } = useState(
  ["name", "telephone", "address", "account"],
  "UserModule"
);
const { handleToName, handleToTelephone, handleToAddress } = useMutations(
  ["handleToName", "handleToTelephone", "handleToAddress"],
  "UserModule"
);

/**
 * 用户信息接口
 */
interface User {
  telephone: string; // 用户电话
  name: string; // 用户的真实姓名
  address: string; // 用户地址
}
/**
 * 用户所有信息集合(用于绑定到表单)
 */
let form = reactive<User>({
  telephone: telephone.value,
  name: name.value,
  address: address.value,
});
/**
 * 给NForm表单一个ref属性
 */
let FormItem = ref<InstanceType<typeof NForm>>();
/**
 * 给修改收货人姓名输入框一个ref属性
 */
let receiptNameRef = ref<InstanceType<typeof NInput>>();
/**
 * 给修改手机号码输入框一个ref属性
 */
let telephoneItemRef = ref<InstanceType<typeof NInput>>();
/**
 * 给修改收货地址输入框一个ref属性
 */
let addressItemRef = ref<InstanceType<typeof NInput>>();
/**
 * 用来保存setTimeout函数
 */
let timing = ref<number>(0);

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
          } else if (res.data.status === "error") {
            if (typeof errorMess === "string") $message.error(errorMess); // 弹出失败操作后的提示内容
            console.log(res.data.reason);
            resolve(false);
          }
        }, 1000);
      })
      .catch((error) => {
        resolve(false);
        console.log(error);
      });
  });
};

/**
 * 确认修改用户信息(向后端发送请求)
 * @param type - 修改信息的类型
 */
const submit: (type: string) => void = (type: string): void => {
  if (props.loading) return; // 如果正在请求的话直接退出函数
  // 验证表单
  FormItem.value?.validate((errors) => {
    if (errors) return;
    emits("update:loading", true); // 开始加载动画
    switch (type) {
      case "修改收货人姓名": {
        if (form.name === name.value) {
          emits("update:loading", false); // 结束加载动画
          $message.error("新旧收货人姓名不能相同");
          return;
        }
        const usr = {
          account: Base64.encode(account.value),
          name: Base64.encode(form.name),
        };
        $http(
          [
            "",
            "post",
            { params: Base64.encode(JSON.stringify(usr)) },
          ],
          "修改成功",
          "修改失败"
        ).then((res: boolean): void => {
          if (res) {
            handleToName({ name: form.name }); // 通知vuex的UserModule修改用户名
            emits("update:showDialog", false); // 关闭对话框
          } else receiptNameRef.value?.focus(); // 收货人姓名输入框聚焦
        });
        break;
      }
      case "修改手机号码": {
        if (form.telephone === telephone.value) {
          emits("update:loading", false); // 结束加载动画
          $message.error("新旧手机号码不能相同");
          return;
        }
        const usr = {
          account: Base64.encode(account.value),
          telephone: Base64.encode(form.telephone),
        };
        $http(
          [
            "",
            "post",
            { params: Base64.encode(JSON.stringify(usr)) },
          ],
          "修改成功",
          "修改失败"
        ).then((res: boolean): void => {
          if (res) {
            handleToTelephone({ telephone: form.telephone }); // 通知vuex的UserModule修改用户名
            emits("update:showDialog", false); // 关闭对话框
          } else telephoneItemRef.value?.focus(); // 手机号码输入框聚焦
        });
        break;
      }
      case "修改收货地址": {
        if (form.address === address.value) {
          emits("update:loading", false); // 结束加载动画
          $message.error("新旧收货地址不能相同");
          return;
        }
        const usr = {
          account: Base64.encode(account.value),
          address: Base64.encode(form.address),
        };
        $http(
          [
            "",
            "post",
            { params: Base64.encode(JSON.stringify(usr)) },
          ],
          "修改成功",
          "修改失败"
        ).then((res: boolean): void => {
          if (res) {
            handleToAddress({ address: form.address }); // 通知vuex的UserModule修改用户名
            emits("update:showDialog", false); // 关闭对话框
          } else addressItemRef.value?.focus(); // 用户名输入框聚焦
        });
        break;
      }
    }
  });
};

/**
 * 修改用户名，设置真实姓名、电话以及地址输入框的验证
 * @param title - 判断是哪种输入框的验证
 * @param count - 有些输入框的总位数
 * @return 返回错误类型或者true
 */
const validateInput: (
  title: string,
  count?: number
) => (rules: FormItemRule, value: string) => boolean | Error =
  (
    title: string,
    count?: number
  ): ((rules: FormItemRule, value: string) => boolean | Error) =>
  (rules: FormItemRule, value: string): boolean | Error => {
    if (!value && title !== "重复密码") return new Error(`${title}不能为空`);
    else if (!value.match(/^1/g) && title === "手机号码")
      return new Error(`${title}只能以1开头`);
    else if (/[^0-9]/g.test(value) && title === "手机号码")
      return new Error(`${title}只能由数字组成`);
    else if (value.length < (count as number) && title === "手机号码")
      return new Error(`${title}不能少于${count}位`);
    return true;
  };
// 表单各项的验证规则
const rules: FormRules | any = {
  name: {
    required: true,
    trigger: "blur",
    message: "收货人姓名不能为空",
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
};

onMounted(() => {
  timing.value = setTimeout(() => {
    // 每次打开对应对话框时实现相应的输入框聚焦
    switch (props.opeartionType) {
      case "修改收货人姓名":
        receiptNameRef.value?.focus();
        break;
      case "修改手机号码":
        telephoneItemRef.value?.focus();
        break;
      case "修改收货地址":
        addressItemRef.value?.focus();
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
  &-form__item {
    margin: 10px 0 -15px 30px;
  }
  &-input__item {
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