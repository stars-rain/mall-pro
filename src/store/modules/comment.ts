import type { Module } from "vuex"
import type { RootState, CommentState } from "../interface"
// import { $axios } from '@/plugins/axios'

const CommentModule: Module<CommentState, RootState> = {
  namespaced: true,
  state: () => ({
    commentList: [], // 评论列表
  }),
  mutations: {
    addComment(state, payload: Comments): void {
      state.commentList.push(payload);
    },
  },
  actions: {
  },
}

export default CommentModule