import type { InjectionKey } from 'vue'
import { createStore, useStore as baseStore, Store } from 'vuex'
import { $axios } from '@/plugins/axios'
import UserModule from "./modules/user"
import CartModule from "./modules/cart"
import CommentModule from "./modules/comment"
import CollectModule from './modules/collects'
import OrderModule from "./modules/order"
import type { RootState, AllState } from './interface'

/* 定义类型化的 InjectionKey */
export const key: InjectionKey<Store<RootState>> = Symbol()

/**
 * 请求数据的一个封装
 * @param url - 请求的url
 * @param method - 请求的方法
 * @param params - 请求的参数
 * @returns 带有vuex根部state属性和vuex根部的state属性内的对象属性参数的一个async函数
 */
function $http<T>(
  url: string,
  method: 'get' | 'post' = 'get',
  params?: T): (state: RootState,
    type: keyof RootState,) => Promise<boolean> {
  return async (state: RootState,
    type: keyof RootState,): Promise<boolean> => {
    try {
      const { data } = await $axios([url, method, params]);
      state[type] = data ? data : state[type];
      if (
        JSON.stringify(state[type]) === '[]' ||
        JSON.stringify(state[type]) === '{}'
      ) return Promise.reject(false)
      return Promise.resolve(true)
    } catch (error) {
      console.log(error);
      return Promise.reject(false)
    }
  }
}

export default createStore<RootState>({
  state: () => ({
    commodityTypesDatas: [],
    carouselDatas: [],
    phoneDatas: {} as Phone,
    homeAppliances: {} as Phone,
    commodityDetailsDatas: {} as CommodityDetails,
  }),
  mutations: {
    handleToCollectState(state): void {
      if (state.commodityDetailsDatas.isLove) state.commodityDetailsDatas.isLove = false;
    },
  },
  actions: {
    /**
     * 请求头部商品分类导航数据
     * @param state - 根部state属性
     */
    getCommodityTypesDatas({ state }): Promise<boolean> {
      return $http('/head')(state, 'commodityTypesDatas')
    },
    /**
     * @param state - 根部state属性
     */
    getCarouselDatas({ state }): Promise<boolean> {
      return $http('/slideshow')(state, 'carouselDatas');
    },
    /**
     * 请求手机模块的数据
     * @param state - 根部state属性
     */
    getPhoneDatas({ state }): Promise<boolean> {
      return $http('/body', 'get', { title: '手机' })(state, 'phoneDatas');
    },
    /**
     * 请求家电模块的数据
     * @param state - 根部state属性
     */
    getHomeAppliances({ state }): Promise<boolean> {
      return $http('/body', 'get', { title: '家电' })(state, 'homeAppliances');
    },
    /**
     * 请求商品详情数据
     * @param state - 根部state属性
     */
    getCommodityDetailsDatas({ state }, payload: { id: number, account: string }): Promise<boolean> {
      return $http('/detailsPage', 'get', payload)(state, 'commodityDetailsDatas');
    },
  },
  modules: {
    UserModule,
    CartModule,
    CommentModule,
    CollectModule,
    OrderModule,
  },
})

export const useStore = <T = AllState>(): Store<T> => baseStore<T>(key);