import { Directive } from "@vue/runtime-core";

const scroll: Directive = {
    mounted(el, binding): void {
        el.onmousedown = (e: MouseEvent): void => {
            el.style.backgroundColor = 'rgba(0, 0, 0, 0.315)';
            /**
             * 鼠标点击处距离浏览器上边界的距离
             */
            const distY: number = e.clientY;
            /**
             * 滚动条轨道的高度
             */
            const scrollTrackHei: number = +binding.value.maxHei.replace('px', '');
            /**
             * 滚动条的高度
             */
            const scrollHei: number = el.offsetHeight;
            /**
             * 滚动条距离轨道顶部的距离
             */
            const top: number = el.offsetTop;
            /**
             * 滚动条最大滚动距离
             */
            const maxHei: number = scrollTrackHei - scrollHei - top;

            const dropDown = (e: MouseEvent): void => {
                /**
                 * 鼠标向上移动的距离
                 */
                let moveY: number = e.clientY - distY;

                /**
                 * 边界情况
                 */
                if (moveY > maxHei) moveY = maxHei
                else if (-moveY > top) moveY = -top

                // 通知元素开始移动
                binding.value.dropDown(top + moveY);
            }

            document.onmousemove = dropDown;

            document.onmouseup = (e: MouseEvent): void => {
                el.style.backgroundColor = '';
                if (document.onmousemove) document.onmousemove = null;
                // 隐藏滚动条(如果此时鼠标悬停在目标元素外才隐藏)
                if (
                    binding.value.ele &&
                    !document.getElementById(binding.value?.ele)?.contains(e.target as HTMLDivElement)
                )
                    binding.value.handleToshowThumb(false);
                document.onmouseup = null;
            }
        }
    },
}

export default scroll