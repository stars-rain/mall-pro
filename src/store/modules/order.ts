import type { Module } from "vuex"
import type { RootState, OrderState } from "../interface"
import $http from "./$http";

const orderModule: Module<OrderState, RootState> = {
  namespaced: true,
  state: () => ({
    orderDatas: [],
  }),
  mutations: {
    // 清空数据
    clearOrderDatas(state): void {
      state.orderDatas.splice(0);
    },
    // 删除订单数据
    $_deleteOrderDatas(state, payload: { ids: Array<number> }): void {
      payload.ids.forEach(id => {
        const index: number = state.orderDatas.findIndex(item => item.id === id);
        state.orderDatas.splice(index, 1);
      })
    },
  },
  actions: {
    // 获取历史订单数据
    async getOrderDatas({ state }, payload: { account: string }): Promise<boolean> {
      return await $http('/getOrder', 'post')(
        payload,
        ({ order }) => state.orderDatas = order,
      )
    },
    // 删除订单数据
    async deleteOrderDatas({ commit }, payload: { ids: Array<number> }): Promise<boolean> {
      return await $http('/deleteOrder', 'post')(
        payload,
        () => commit('$_deleteOrderDatas', payload),
      )
    },
  },
}

export default orderModule