/**
 * 在输入框中插入表情
 * @param ele - 目标输入框元素
 * @param content - 原评论内容
 * @returns 返回一个接受两个参数并且返回处理后的评论内容的函数(第一个参数为具体哪个表情string, 第二个为输入框的字数限制number[默认140])
 */
const insertEmotions: (
    ele: HTMLInputElement | HTMLTextAreaElement,
    content: string,
    ) => (
      emotion: string,
      count?: number,
    ) => string = (
      ele: HTMLInputElement | HTMLTextAreaElement,
      content: string,
    ): (emotion: string, count?: number) => string => {
      /**
       * @param emotion - 具体哪个表情
       * @param count - 输入框的数字限制
       * @returns 插入表情后的评论内容
       */
      return (emotion: string, count: number = 140): string => {
        /**
         * 将表情转换为[表情语]形式(如: '微笑'表情转换为[微笑])
         */
        const emotionString: string = `[${emotion}]`;
        /**
         * 插入表情后的评论内容
         */
        let comment: string = content;
        /**
         * 输入框光标悬停的首位置
         */
        const startPos: number = ele.selectionStart as number;
        /**
         * 如果用户选中一段文本时此时被选中文本末的位置
        */
        const endPos: number = ele.selectionEnd as number;
        comment = comment.slice(0, startPos) +emotionString +
        (startPos === endPos ? comment.slice(startPos) : comment.slice(endPos));

        // 如果超过字数则不作处理
        if (comment.length > count) return content

        // 输入框聚焦并且正确显示光标位置
        /**
         * 插入表情后此时光标应该出现的正确位置
         */
        const afterLocation: number = startPos + emotionString.length;
        // 正确显示光标位置
        setTimeout(() => {
          ele.setSelectionRange(afterLocation, afterLocation);
          ele.focus();
        }, 0)

        return comment
      }
    }

export { insertEmotions }