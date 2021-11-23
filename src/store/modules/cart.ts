import type { Module } from "vuex"
import type { RootState, CartState } from "../interface"
import { $axios } from '@/plugins/axios'

/**
 * 对购物车操作请求的一个封装
 * @param url - 请求地址 
 * @param methods - 请求方法
 * @returns 返回一个接受请求参数、请求成功的回调函数这两个参数的函数(请求主体在这函数里面)
 */
const $http: (url: string, methods: 'patch' | 'delete' | 'post') =>
  <T>(params: T, callback: (...arg: any[]) => any) =>
    Promise<boolean> = (url: string, methods: 'patch' | 'delete' | 'post'): <T>(params: T, callback: (...arg: any[]) => any) =>
      Promise<boolean> => {
    return <T>(params: T, callback: (...arg: any[]) => any): Promise<boolean> => {
      return new Promise<boolean>((resolve, reject) => {
        $axios([url, methods, params]).then(res => {
          if (res.data.status === 'success') {
            callback(); // 执行回调函数
            resolve(true);
          } else reject(false);
        }).catch(error => {
          console.log(error);
          reject(false);
        })
      })
    }
  }

const UserModule: Module<CartState, RootState> = {
  namespaced: true,
  state: () => ({
    status: 1, // 用户操作购物车的一个状态，0代表购物车数据未发生改变
    cartList: [], // 购物车数据
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
  },
  actions: {
    // 向后台发送购物车数据
    // eslint-disable-next-line no-empty-pattern
    async sendCartDatas({ }, payload: { account: string, id: number }): Promise<boolean> {
      try {
        const { data } = await $axios(['/addCart', 'post', {
          account: payload.account,
          id: payload.id,
        }]);
        if (data.status === 'success') return Promise.resolve(true);
        else {
          console.log(data.reason);
          return Promise.reject(false);
        }
      }
      catch (error) {
        console.log(error);
        return Promise.reject(false)
      }
    },
    // 向后台请求购物车数据
    async getCartDatas({ state }, payload: { account: string }): Promise<boolean> {
      try {
        const { data } = await $axios(['/getCart', 'post', {
          account: payload.account,
        }]);
        if (data.status === 'success') {
          state.cartList = data.messages.cart;
          return Promise.resolve(true);
        } else {
          console.log(data.reason);
          return Promise.reject(false)
        }
      }
      catch (error) {
        console.log(error);
        return Promise.reject(false)
      }
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