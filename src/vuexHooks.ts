import { createNamespacedHelpers, mapState, mapMutations } from "vuex"
import { useStore } from "./store/index"
import { computed } from "vue"

// 判断当前需要哪种vuex辅助函数的类型的一个对象接口
interface mapStore {
    isMapMutations: boolean; // 是否是mapMutations类型
    isMapState: boolean; // 是否是mapState类型
}

/**
 * 改变vuex辅助函数如mapState、mapMutations等内部属性值函数的this的指向(方便在setup中使用vuex辅助函数)
 * @param mapperFn - vuex辅助函数类型
 * @param mapper - 需要通过vuex辅助函数访问的数据属性(可能是一个数组或者一个对象)
 * @param mapStore - 判断当前需要哪种vuex辅助函数的类型
 * @returns - 返回通过vuex辅助函数获取的数据对象值
 */
const useMapper: <T extends { [key: string]: any }>(
    mapperFn: T,
    mapStore: mapStore,
)
    => T = <T extends { [key: string]: any }>(
        mapperFn: T,
        mapStore: mapStore,
    ): T => {
        const store = useStore();
        const storeAttri: { [key: string]: any } = {};
        // 遍历对象的属性值，拿出其值，也就是一个函数
        Object.keys(mapperFn).forEach((key: string) => {
            // 改变其函数内部的this指向
            const fn = mapperFn[key].bind({ $store: store });
            // 如果是mapMuatations或者是mapActions时则直接赋予给属性对应的函数值
            if (mapStore.isMapMutations) storeAttri[key] = fn;
            // 如果是mapState或者是mapGetters的话则需要放在computed函数中进行返回
            else if (mapStore.isMapState) storeAttri[key] = computed(fn);
        })
        return <T>storeAttri
    }

/**
 * 通过mapState辅助函数获取vuex里面state属性的数据
 * @param mapper - 需要通过vuex辅助函数访问的数据属性(可能是一个数组或者一个对象)
 * @param moduleName - 模板名称(如果有模板的话)
 * @returns 返回经过useMapper函数处理后返回的相应的数据对象值
 */
const useState: <T extends { [key: string]: any }>(mapper: T, moduleName?: string)
    => any = <T extends { [key: string]: any }>(mapper: T | { [key: string]: any }, moduleName?: string):
        any => {
        let mapperFn = mapState;
        if (moduleName) {
            // 调用对应模板的mapState
            const { mapState } = createNamespacedHelpers(moduleName);
            mapperFn = mapState
        }
        return useMapper(mapperFn(mapper), { isMapMutations: false, isMapState: true });
    }

/**
 * 通过mapMutations辅助函数获取vuex里面state属性的数据
 * @param mapper - 需要通过vuex辅助函数访问的数据属性(可能是一个数组或者一个对象)
 * @param moduleName - 模板名称(如果有模板的话)
 * @returns 返回经过useMapper函数处理后返回的相应的数据对象值
 */
const useMutations: <T extends { [key: string]: any }>(mapper: T, moduleName?: string)
    => any = <T extends { [key: string]: any }>(mapper: T, moduleName?: string): any => {
        let mappFn = mapMutations;
        if (moduleName) {
            // 调用对应模板的mapMutations
            const { mapMutations } = createNamespacedHelpers(moduleName);
            mappFn = mapMutations;
        }
        return useMapper(mappFn(mapper), { isMapMutations: true, isMapState: false })
    }

export { useState, useMutations }