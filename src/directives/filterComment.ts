import { Directive } from "@vue/runtime-core";
import emotions from "@/staticDatas/emotions";
import { Emotion } from "@/staticDatas/interface";

const filterComment: Directive = {
  beforeMount(el, binding): void {
    if (binding.value) {
      /**
       * 评论的内容
       */
      let comment: string = binding.value;
      // 过滤 HTML 字符串，防止用户输入恶意内容
      comment = comment.replaceAll(/&/g, "&amp;").replaceAll(/</g, "&lt;").replaceAll(/>/g, "&gt;");
      // 先检索评论中是否有[这里包含中文]的字式模块
      if (/\[[\u4e00-\u9fa5]+\]/.test(comment)) {
        (comment.match(/\[[\u4e00-\u9fa5]+\]/g)!).forEach((emotion: string): void => {
          const len: number = emotion.length;
          // 提取出[]内的内容
          const temp: string = emotion.slice(1, len - 1);
          // 如果是表情的话则[...]的长度必会在3~5之间
          if (len >= 3 && len <=5) {
            emotions.forEach((item: Emotion): void => {
              // 如果能在表情库里找到则代表它一定是表情
              if (item.emotion === temp) {
                const image: string = `<img draggable="false" 
                  style="
                  cursor: text;
                  user-select: none;
                  -webkit-user-select: none;
                  -moz-user-select: none;
                  vertical-align: middle;
                  "
                  src="https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/${item.id}.gif"
                  alt="加载失败"
                  "/>`;
                comment = comment.replaceAll(emotion, image);
              }
            })
          }
        })
      }
      el.innerHTML = comment;
    }
  },
};

export default filterComment