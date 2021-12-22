import type { createApp } from "@vue/runtime-dom";

let scrollHei: number = 0;

export function getScrollHei(): number {
  if (scrollHei !== 0) return scrollHei;
  const outEle: HTMLDivElement = document.createElement('div');
  const innerEle: HTMLDivElement = document.createElement('div');
  const outEleSty = outEle.style;
  const innerSty = innerEle.style;
  outEleSty.cssText += 'width: 200px;height: 100px;position: absolute;top: 0;right: 0;visibility: hidden;overflow: scroll';
  innerSty.cssText += 'width: 100%;height: 100px;'
  document.body.append(outEle);
  outEle.append(innerEle);
  const outWid: number = outEle.offsetWidth;
  const innerWid: number = innerEle.offsetWidth;
  scrollHei = outWid - innerWid;
  document.body.removeChild(outEle);
  return scrollHei
}

export default {
    install(app: ReturnType<typeof createApp>): void {
        app.config.globalProperties.$getScrollHei = getScrollHei(); // 将axios注入app实例
    }
}