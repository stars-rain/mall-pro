import type { Module } from "vuex"
import type { RootState, CollectState } from "../interface"
import $http from "./$http";

const collectModule: Module<CollectState, RootState> = {
  namespaced: true,
  state: () => ({
    collectDatas: [],
    collectLen: 0,
    needPage: 1,
  }),
  mutations: {
    /**
     * 改变当前页面所需要的页码数
     */
    handleToNeedPage(state, payload: { page: number }): void {
      state.needPage = payload.page;
    },
    /**
     * 清空数据
     */
    clearCollectDatas(state): void {
      if (state.collectDatas.length) state.collectDatas.splice(0);
      if (state.collectLen !== 0) state.collectLen = 0;
    },
  },
  actions: {
    // eslint-disable-next-line no-empty-pattern
    async addCollect({ }, payload: { id: number, account: string }): Promise<boolean> {
      return await $http('/addCollect', 'post')(payload);
    },
    async getCollect({ state }, payload: { account: string, page: number }): Promise<boolean> {
      return await $http('/getCollectDatas', 'post')(
        payload,
        ({ productList, count }) => {
          state.collectDatas = productList;
          state.collectLen = count;
        }
      );
    },
    async deleteCollect({ state }, payload: { ids: Array<number>, page: number }): Promise<boolean> {
      return await $http('/deleteCollect', 'post')(
        payload,
        ({ productList, count }) => {
          state.collectDatas = productList;
          state.collectLen = count;
        }
      );
    },
  },
}

export default collectModule