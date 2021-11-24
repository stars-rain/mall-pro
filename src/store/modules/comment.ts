import type { Module } from "vuex"
import type { RootState, CommentState } from "../interface"
// import { $axios } from '@/plugins/axios'

const CommentModule: Module<CommentState, RootState> = {
  namespaced: true,
  state: () => ({
    commentList: [], // 评论列表
  }),
  mutations: {
    // 添加评论
    addComment(state, payload: { content: Comments }): void {
      state.commentList.push(payload.content);
    },
    // 添加回复
    addReplayComment(state, payload: { index: number, content: Comments & { replaiedName: string } }): void {
      const comment: Comments = state.commentList[payload.index];
      comment.replay.push(payload.content);
    },
    // 隐藏回复的评论
    hideReplay(state): void {
      state.commentList.forEach(item => {
        if (item.showReplay) item.showReplay = false;
      })
    },
  },
  actions: {
  },
}

export default CommentModule