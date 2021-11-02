import type { Module } from "vuex"
import type { RootState, UserState } from "../interface"
import { $axios } from '@/plugins/axios'
import { Base64 } from "js-base64"

const UserModule: Module<UserState, RootState> = {
  namespaced: true,
  state: () => ({
    name: '', // 用户的真实姓名,
    account: '', // 用户账号
    telephone: '', // 用户的手机号码,
    address: '', // 用户地址
    isLogin: false, // 用户是否登录
    userName: '', // 用户名
    avatarSrc: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', // 用户头像
  }),
  mutations: {
    // 获取用户账号
    handleToAccount(state, payload: { account: string } = { account: '' }): Promise<boolean> {
      state.account = payload.account;
      return Promise.resolve(true)
    },
    // 设置用户真实姓名
    handleToName(state, payload: { name: string } = { name: '' }): Promise<boolean> {
      state.name = payload.name;
      return Promise.resolve(true)
    },
    // 设置用户手机号码
    handleToTelephone(state, payload: { telephone: string } = { telephone: '' }): Promise<boolean> {
      state.telephone = payload.telephone;
      return Promise.resolve(true)
    },
    // 设置用户地址
    handleToAddress(state, payload: { address: string } = { address: '' }): Promise<boolean> {
      state.address = payload.address;
      return Promise.resolve(true)
    },
    // 改变登录状态
    handleToLogin(state, payload: { isLogin: boolean } = { isLogin: false }): Promise<boolean> {
      state.isLogin = payload.isLogin;
      return Promise.resolve(true)
    },
    // 如果用户已经登录刷新页面时获取用户的昵称
    handleToUserName(state, payload: { name: string } = { name: '' }): Promise<boolean> {
      state.userName = payload.name;
      return Promise.resolve(true)
    },
    // 改变用户的头像
    handleToAvatar(
      state,
      payload: { src: string } = {
        src: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
      }): Promise<boolean> {
      state.avatarSrc = payload.src;
      return Promise.resolve(true)
    },
  },
  actions: {
    async getUserMessage({ state, commit }, payload: { account: string }): Promise<boolean> {
      try {
        const { data } = await $axios([
          '/refresh',
          'post',
          { params: Base64.encode(JSON.stringify({ account: Base64.encode(payload.account) })) },
        ]);
        if (data.status === 'success') {
          const usr = JSON.parse(Base64.decode(data.messages.user));
          Object.keys(usr).forEach((key: string) => usr[key]?.length ? (state as any)[key] = usr[key] : null);
          // 此时用户已是登录状态
          commit('handleToLogin', { isLogin: true });
          return Promise.resolve(true);
        }
        return Promise.reject(false);
      } catch (error) {
        console.log(error);
        return Promise.reject(false)
      }
    },
  },
}

export default UserModule