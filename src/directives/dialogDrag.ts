import { Directive } from "@vue/runtime-core";

const dialogDrag: Directive = {
  mounted(el, binding): void {
    if (!binding.value.draggable) return
    /**
     * 对话框的头部元素
     */
    const eleHeader: HTMLDivElement = el.querySelector('.dialog-header');

    /**
     * 对话框的父元素
     */
    const elParent: HTMLElement = el.parentNode;


    el.resize = (): void => {
      const elParentWid: number = elParent.offsetWidth;

      if (el.offsetWidth + el.offsetLeft > elParentWid) {
        const left = elParentWid - el.offsetWidth;

        el.style.left = `${left}px`
      }
    }
    window.addEventListener('resize', el.resize)

    eleHeader.onmousedown = (e: MouseEvent): void => {
      /**
       * 鼠标点击处距离浏览器左边界的距离
       */
      const disX: number = e.clientX;
      /**
       * 鼠标点击处距离浏览器上边界的距离
       */
      const distY: number = e.clientY;
      /**
       * 对话框距离浏览器上边界的距离
       */
      const dialogTop: number = el.offsetTop;
      /**
       * 对话框距离浏览器左边界的距离
       */
      const dialogLeft: number = el.offsetLeft;
      /**
       * 目标元素的父元素可视宽度
       */
      const bodyWid: number = elParent.offsetWidth;
      /**
       * 浏览器的可视高度
       */
      const bodyHei: number = elParent.offsetHeight;
      /**
       * 对话框的宽度
       */
      const dialogWid: number = el.offsetWidth;
      /**
      * 对话框的高度
      */
      const dialogHei: number = el.offsetHeight;
      /**
       * 鼠标在水平方向最多可移动的巨鹿
       */
      const moveX: number = bodyWid - dialogWid - dialogLeft;
      /**
       * 鼠标在竖直方向最多可移动的巨鹿
       */
      const moveY: number = bodyHei - dialogHei - dialogTop;

      document.onmousemove = (e: MouseEvent): void => {
        /**
         * 鼠标向左移动的距离
         */
        let left: number = e.clientX - disX;
        /**
         * 鼠标向上移动的距离
         */
        let top: number = e.clientY - distY;

        // 边界处理
        if (left > moveX) left = moveX;
        else if (-left > dialogLeft) left = -dialogLeft;

        if (top > moveY) top = moveY;
        else if (-top > dialogTop) top = -dialogTop;

        el.style.cssText += `left: ${dialogLeft + left}px; top: ${dialogTop + top}px`;
      }

      document.onmouseup = (): void => {
        if (binding.value.focus) binding.value.focus(); // 如果对话框有输入框且需要聚焦的话则聚焦
        if (document.onmousemove) document.onmousemove = null;
        document.onmouseup = null;
      }
    }
  },
  beforeUnmount(el): void {
    window.removeEventListener('resize', el.resize);
  },
}

export default dialogDrag