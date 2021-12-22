import type { Module } from "vuex"
import type { RootState, CartState } from "../interface"
import $http from "./$http";

const UserModule: Module<CartState, RootState> = {
  namespaced: true,
  state: () => ({
    status: 1, // 用户操作购物车的一个状态，0代表购物车数据未发生改变
    cartList: [], // 购物车数据
    isPayFor: false, // 用户是否在付款
  }),
  mutations: {
    // 用户的购物车状态是否发生改变
    handleToStatus(state, payload: { status: number } = { status: 0 }): void {
      state.status = payload.status;
    },
    // 删除购物车中的某件商品
    $_deleteCart(state, payload: { ids: Array<number> }): void {
      payload.ids.forEach((id: number) => {
        state.cartList.forEach((item: CartItem, index) => {
          if (item.id === id) state.cartList.splice(index, 1);
        })
      });
    },
    // 增加或删除商品的对应数量
    $_handleToCount(state, payload: { id: number, count: number }): void {
      // 找到对应的商品所在的位置
      const index: number = state.cartList.findIndex(item => item.id === payload.id);
      state.cartList[index].count += payload.count;
      // 总价格也需改变
      state.cartList[index].cost = state.cartList[index].count * state.cartList[index].price;
    },
    // 改变对应商品数量
    $_changeToCount(state, payload: { id: number, count: number }): void {
      // 找到对应的商品所在的位置
      const index: number = state.cartList.findIndex(item => item.id === payload.id);
      state.cartList[index].count = payload.count;
      // 总价格也需改变
      state.cartList[index].cost = state.cartList[index].count * state.cartList[index].price;
    },
    // 清空购物车
    $_clearCart(state): void {
      state.cartList.splice(0);
    },
    // 改变用户付款状态
    handleToPayFor(state, payload: { isPayFor: boolean }): void {
      state.isPayFor = payload.isPayFor;
    },
  },
  actions: {
    // 向后台发送购物车数据
    // eslint-disable-next-line no-empty-pattern
    async sendCartDatas({ }, payload: { account: string, id: number }): Promise<boolean> {
      return await $http('/addCart', 'post')({
        account: payload.account,
        id: payload.id,
      });
    },
    // 向后台请求购物车数据
    async getCartDatas({ state }, payload: { account: string }): Promise<boolean> {
      return await $http('/getCart', 'post')({
        account: payload.account,
      }, (data) => {  state.cartList = data });
    },
    // 清空购物车
    clearCart({ commit }, payload: { account: string }): Promise<boolean> {
      return $http('/clearCart', 'delete')({
        account: payload.account,
      }, () => { commit('$_clearCart') });
    },
    // 删除购物车中的某件商品
    deleteCart({ commit }, payload: { account: string, ids: Array<number> }): Promise<boolean> {
      return $http('/deleteCart', 'post')({
        account: payload.account,
        ids: payload.ids,
      }, () => { commit('$_deleteCart', { ids: payload.ids }) });
    },
    // 购物车中的某件商品数量+1或者-1
    handleToCount({ commit }, payload: { account: string, id: number, count: number }): Promise<boolean> {
      return $http('/updateCount_order', 'patch')({
        account: payload.account,
        id: payload.id,
        count: payload.count,
      }, () => { commit('$_handleToCount', { id: payload.id, count: payload.count }) });
    },
    // 对购物车中的某件商品数量进行直接赋值
    changeToCount({ commit }, payload: { account: string, id: number, count: number }): Promise<boolean> {
      return $http('/updateCount_noorder', 'patch')({
        account: payload.account,
        id: payload.id,
        count: payload.count,
      }, () => { commit('$_changeToCount', { id: payload.id, count: payload.count }) });
    },
  },
}

export default UserModule