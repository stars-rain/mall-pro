<template>
  <input
    ref="fileEle"
    class="avatar-upload"
    type="file"
    accept="image/*"
    @change="handleToFiles"
  />
  <slot></slot>
</template>

<script lang="ts">
import { defineComponent, ref, defineProps } from "@vue/runtime-core";

export default defineComponent({
  name: "avatarUpload",
  methods: {
    /**
     * 准备上传头像(打开windows文件接口)
     */
    upload(): void {
      (this.$refs.fileEle as HTMLInputElement).click();
    },
  },
});
</script>

<script lang="ts" setup>
import { useStore } from "@/store/index";
import { useMessage } from "naive-ui";
import { $axios } from "@/plugins/axios";
import { dataURItoBlob, pictureCompression } from "@/plugins/pictureProcess";
import { Base64 } from "js-base64";

const props = defineProps<{
  action: string;
}>();

const store = useStore();
const message = useMessage();

// 给input属性一个ref属性
const fileEle = ref<HTMLInputElement>();

/**
 * 监听用户是否已经上传了头像
 */
const handleToFiles: () => void = (): void => {
  const fileList: FileList = fileEle.value?.files as FileList;
  const is4M = fileList[0].size / 1024 / 1024 < 4; // 判断文件的大小是否小于4MB
  if (!is4M) {
    // 如果大于4MB则报错直接返回
    message.error("上传的头像文件大小不能大于4MB");
    return;
  }
  /**
   * 读取文件内容
   */
  const reader: FileReader = new FileReader();
  // 该事件在读取操作完成时触发。
  reader.onload = async (e: ProgressEvent<FileReader>) => {
    // 改变当前vuex保存的登录用户的头像路径
    let form: FormData = new FormData();
    const img: string = e.target?.result as string;
    let imgBlob: Blob = dataURItoBlob(img);
    // 如果图片大于0.5MB的话则压缩图片
    if (fileList[0].size / 1024 / 1024 > 0.5) {
      let value: Blob = await pictureCompression(img, { quality: 0.25 });
      imgBlob = value;
    }
    form.append("avatarFile", imgBlob);
    form.append("account", Base64.encode(store.state.UserModule.account));

    $axios([props.action, "post", form])
      .then((res) => {
        if (res.data.status === "success") {
          store.commit("UserModule/handleToAvatar", {
            src: res.data.messages.avatarSrc,
          });
          message.success("上传成功");
        } else message.error("上传失败");
      })
      .catch((error) => {
        console.log(error);
        message.error("上传失败");
      });
  };
  // 读取指定的Blob或File对象
  reader.readAsDataURL(fileList[0]);
};
</script>

<style lang="less" scoped>
.avatar {
  &-upload {
    display: none;
  }
}
</style>