import { InjectionKey } from 'vue'
import { createStore, useStore as baseStore, Store } from 'vuex'
import { $axios } from '@/plugins/axios'

export interface State {
  /**
   * 头部商品分类导航数据
   */
  commodityTypesDatas: Array<CommodityTypes>,
  /**
   * 头部轮播图数据
   */
  carouselDatas: Array<Carousel>,
}

/* 定义类型化的 InjectionKey */
export const key: InjectionKey<Store<State>> = Symbol()

export default createStore<State>({
  state: () => ({
    commodityTypesDatas: [],
    carouselDatas: []
  }),
  mutations: {
    /**
     * @param state 得到头部商品分类导航数据
     */
    async getCommodityTypesDatas(state): Promise<void> {
      try {
        const { data } = await $axios('/head');
        state.commodityTypesDatas = data;
      } catch (error) {
        console.log(error);
      }
    },
    /**
     * @param state 头部轮播图数据
     */
    async getCarouselDatas(state): Promise<void> {
      try {
        const { data } = await $axios('/slideshow');
        state.carouselDatas = data;
      } catch (error) {
        console.log(error);
      }
    },
  },
  actions: {
  },
  modules: {
  }
})

export const useStore = (): Store<State> => baseStore(key);
