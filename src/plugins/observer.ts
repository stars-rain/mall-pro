import type { createApp } from "@vue/runtime-dom";

export default {
    install(app: ReturnType<typeof createApp>): void {
        /**
         * 主要作用是实现图片的懒加载
         * @param {Array<HTMLElement | HTMLElement>} ele - 被观察的元素
         */
        function observer(ele: HTMLElement | Array<HTMLElement>): void {
            /**
             * 被观察元素执行的回调函数
             * @param {IntersectionObserverEntry[]} entries - 所有被观察元素的一个数据集合
             */
            const callback: IntersectionObserverCallback = (entries: IntersectionObserverEntry[]): void => {
                entries.forEach((entry: IntersectionObserverEntry) => {
                    /**
                     * 被观察的目标元素
                     */
                    const target: Element = entry.target;
                    // 如果目标元素出现在可视区域内
                    if (entry.isIntersecting) {
                        /* 延迟懒加载图片 */
                        setTimeout(() => {
                            target.setAttribute('src', target.getAttribute('data-src') as string);
                        }, 150);
                        observe.unobserve(target); // 对该元素停止观察
                    }
                })
            }

            /**
             * 判断被观察的元素是数组还是非数组
             * @param {Array<HTMLElement | HTMLElement>} ele - 被观察的元素
             * @returns {Boolean} 
             */
            const isArray: (
                ele: Array<HTMLElement> | HTMLElement
            ) => ele is Array<HTMLElement> = (
                ele: Array<HTMLElement> | HTMLElement): ele is Array<HTMLElement> =>
                    Object.prototype.toString.call(ele).indexOf('Array') > -1;

            /**
             * @type {IntersectionObserver} 建立一个观察者函数
             */
            const observe: IntersectionObserver = new IntersectionObserver(callback);
            if (isArray(ele)) {
                /* 是数组的话观察里面的每个元素 */
                ele.forEach((item: HTMLElement) => (observe.observe(item)));
            } else observe.observe(ele)
        }

        app.config.globalProperties.$observer = observer;
    }
}