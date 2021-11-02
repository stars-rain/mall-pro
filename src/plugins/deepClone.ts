import type { createApp } from "vue"

/**
 * 实现深拷贝
 * @param data - 需要深拷贝的数据
 * @returns 深拷贝后的数据
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function deepClone<T> (data: T): T {
  let currentData: T;
  if (Object.prototype.toString.call(data).indexOf('Object') > -1) {
    currentData = {} as any;
    for (const [key, value] of Object.entries(data)) {
      (currentData as any)[key] = deepClone(value);
    }
  } else if (Object.prototype.toString.call(data).indexOf('Array') > -1) {
    currentData = [] as any;
    for (const value of data as any) {
      (currentData as any).push(deepClone(value))
    }
  } else currentData = data
  return currentData
}

export default {
  install(app: ReturnType<typeof createApp>): void {
    app.config.globalProperties.$deepClone = deepClone; // 将axios注入app实例
  }
}
