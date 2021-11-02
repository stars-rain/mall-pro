/**
 * @class
 * @classdesc 一个实现折叠动画的类 (transition组件的javascript钩子函数)
 */
class Transition {
    /**
     * @constructs
     * @param mode transition过渡模式
     */
    constructor(public mode?: 'out-in' | 'in-out' | "default", public css?: boolean) { }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    'onBefore-enter'(el: any): void {
        if (el.getAttribute('data-before-active')) return
        el.classList.toggle('collapse-transition', true); // 给折叠动画的目标元素加入一个类名
        if (!el.data) el.data = {}; // 建立一个容器来保存目标元素的初始数据

        el.data.oldPaddingTop = el.style.paddingTop; // 保存目标元素的上内边距
        el.data.oldPaddingBottom = el.style.paddingBottom; // 保存目标元素的下内边距

        el.style.cssText += "height: 0; padding-top: 0; padding-bottom: 0";
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    onEnter(el: any): void {
        if (el.getAttribute('data-before-active')) return
        el.data.oldOverflow = el.style.overflow; // 保存目标元素的overflow属性
        el.style.overflow = 'hidden';
        if (el.scrollHeight) {
            /* 恢复目标元素的一些原始css属性 */
            el.style.height = `${el.scrollHeight}px`;
            el.style.paddingTop = el.data.oldPaddingTop;
            el.style.paddingBottom = el.data.oldPaddingBottom;
        } else {
            el.style.paddingTop = el.data.oldPaddingTop;
            el.style.paddingBottom = el.data.oldPaddingBottom;
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    'onAfter-enter'(el: any): void {
        if (el.getAttribute('data-before-active')) return
        el.classList.toggle('collapse-transition', false); // 移除给折叠动画的目标元素加的类名
        el.style.height = ''; // el元素的style属性中不会显示height属性
        el.style.overflow = el.data?.oldOverflow;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    'onBefore-leave'(el: any): void {
        if (el.getAttribute('data-active')) return;
        el.classList.toggle('collapse-transition', true); // 给折叠动画的目标元素加入一个类名
        if (!el.data) el.data = {}; // 建立一个容器来保存目标元素的初始数据

        el.data.oldOverflow = el.style?.overflow; // 保存目标元素的overflow属性
        el.data.oldPaddingTop = el.style.paddingTop; // 保存目标元素的上内边距
        el.data.oldPaddingBottom = el.style.paddingBottom; // 保存目标元素的下内边距

        el.style.cssText += `height: ${el.scrollHeight}px;overflow: hidden`;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    onLeave(el: any): void {
        if (el.getAttribute('data-active')) return;
        if (el.scrollHeight) {
            el.style.cssText += "height: 0; padding-top: 0; padding-bottom: 0";
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    'onAfter-leave'(el: any): void {
        if (el.getAttribute('data-active')) return;
        el.classList.toggle('collapse-transition', false); // 移除给折叠动画的目标元素加的类名
        el.style.height = ''; // el元素的style属性中不会显示height属性
        el.style.overflow = el.data?.oldOverflow;
        el.style.paddingTop = el.data?.oldPaddingTop;
        el.style.paddingBottom = el.data?.oldPaddingBottom;
    }
}

export default Transition