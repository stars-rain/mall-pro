import type { Module } from "vuex"
import type { RootState, CommentState } from "../interface"
import $http from "./$http";

const CommentModule: Module<CommentState, RootState> = {
  namespaced: true,
  state: () => ({
    commentList: [], // 评论列表
  }),
  mutations: {
    // 清除vuex缓存的评论数据
    $_clearComment(state): void {
      state.commentList.splice(0);
    },
    // 添加评论
    $_addComment(state, payload: {
      content: Pick<Comments, 'time' | 'comment'>,
      staticData: { avatar: string; userName: string },
      id: number,
    }): void {
      const newCommObj: Comments = Object.assign(
        payload.content,
        payload.staticData,
        {
          showReplay: false,
          type: 0,
          isLiked: false,
          replaiedName: '',
          replay: [],
          thumb: 0,
          replayCount: 0,
          id: payload.id,
          replayStatus: 1,
        },
      );
      state.commentList.push(newCommObj);
    },
    /**
     * 删除某件商品的评论或者删除该条评论的某条回复评论
     * @param state 
     * @param payload - 传入负载对象, 第一个参数为该评论是否为二级评论, 第二个参数为该条评论的id值, 第三个对象为可选, 它是一级评论的id值
     */
    $_deleteComment(state, payload: {
      isTwoLeveComment: boolean,
      commentId: number,
      fatherCommentId?: number,
    }): void {
      // 如果删除的是二级评论
      if (payload.isTwoLeveComment) {
        const fatherComment: Comments = state.commentList[state.commentList.findIndex(item => item.id === payload.fatherCommentId)];
        const replayComment: Array<Comments> = fatherComment.replay;
        replayComment.splice(replayComment.findIndex(item => item.id === payload.commentId), 1);
        fatherComment.replayCount -= 1;
      } else state.commentList.splice(state.commentList.findIndex(item => item.id === payload.commentId), 1);
    },
    /**
     * 对评论进行点赞或者取消点赞
     * @param state 
     * @param payload - 传入负载对象, 第一个参数为用户名, 第二个参数为该条评论的id值，第三个参数为一级评论的id值
     */
    $_isLikeComment(state, payload: { commentId: number, fatherCommentId: number }): void {
      let comment: Comments;
      // 如果用户点赞的是二级评论
      if (payload.fatherCommentId >= 0) {
        const fatherComment: Comments = state.commentList[state.commentList.findIndex(item => item.id === payload.fatherCommentId)];
        const replayComment: Array<Comments> = fatherComment.replay;
        comment = replayComment[replayComment.findIndex(item => item.id === payload.commentId)];
      }
      else comment = state.commentList[state.commentList.findIndex(item => item.id === payload.commentId)];
      comment.thumb += comment.isLiked ? -1 : 1;
      comment.isLiked = !comment.isLiked
    },
  },
  actions: {
    // 获取商品的评论数据
    async getComment({ state }, payload: { id: number, account: string }): Promise<boolean> {
      return await $http('/getComment', 'post')(
        {
          productId: payload.id,
          account: payload.account,
        },
        ({ comments }) => {
          comments.forEach((item: any) => {
          state.commentList.push(Object.assign(item, {
            loading: false,
            showReplay: false,
            replay: []
          }))
        });
      });
    },
    // 获取二级评论数据
    async getReplayComment({ state }, payload: { id: number, account: string }): Promise<boolean> {
      return await $http('/getReplayComment', 'post')(
        {
          id: payload.id,
          account: payload.account,
        },
        ({ comments }) => {
          const comment: Comments = state.commentList[state.commentList.findIndex(item => item.id === payload.id)];
          comments.forEach((item: any) => {
          comment.replay.push(item)
        });
      });
    },
    // 添加评论
    async addComment(
      { commit },
      payload: {
        sendData: Pick<Comments, 'time' | 'comment'> & { productId: number; account: string },
        staticData: { avatar: string; userName: string },
      }
    ): Promise<boolean> {
      return await $http('/addComment', 'patch')(
        payload.sendData,
        ({ id }) => {
          Reflect.deleteProperty(payload.sendData, "productId");
          Reflect.deleteProperty(payload.sendData, "account");
          setTimeout(() => {
            commit('$_addComment', {
              content: payload.sendData,
              staticData: payload.staticData,
              id,
            });
          }, 400);
        });
    },
    // 添加回复
    async addReplayComment(
      { state },
      payload: {
        sendData: Pick<Comments, 'time' | 'comment'> & {
          productId: number;
          account: string;
          commentId: number;
        },
        staticData: {
          avatar: string;
          userName: string;
          fatherCommentId: number;
        },
      }
    ): Promise<boolean> {
      return await $http('/addReplayComment', 'patch')(
        payload.sendData,
        ({ id }) => {
          /**
           * 一级评论
           */
          let fatherComment: Comments;
          /**
           * 二级评论
           */
          let comment: Comments;
          /**
           * 回复二级评论时该二级评论的用户名
           */
          let name: string = '';
          // 当用户回复的是二级评论
          if (payload.staticData.fatherCommentId > 0) {
            fatherComment = state.commentList[state.commentList.findIndex(item => item.id === payload.staticData.fatherCommentId)];
            comment = fatherComment.replay[fatherComment.replay.findIndex(item => item.id === payload.sendData.commentId)];
            name = comment.userName;
          } 
          else
            fatherComment = state.commentList[state.commentList.findIndex(item => item.id === payload.sendData.commentId)];
          (fatherComment.replayCount as number) += 1;
          if (fatherComment.showReplay) {
            Reflect.deleteProperty(payload.sendData, "productId");
            Reflect.deleteProperty(payload.sendData, "account");
            Reflect.deleteProperty(payload.staticData, "fatherCommentId");
            setTimeout(() => {
              fatherComment.replay.push(Object.assign(
                payload.sendData,
                payload.staticData,
                {
                  type: 1,
                  isLiked: false,
                  replaiedName: name,
                  replay: [],
                  thumb: 0,
                  replayCount: 0,
                  id,
                }
              ))
            }, 400);
          }
          // 说明二级评论数量发生改变
          else if (fatherComment.replayStatus !== 1 && !fatherComment.showReplay) fatherComment.replayStatus = 1;
        });
    },
    // 点赞评论
    async handleToThumb(
      { commit },
      payload: {
        sendData: {
          account: string;
          commentId: number;
          fatherCommentId: number;
       },
    }): Promise<boolean> {
      return await $http('/isLikeComment', 'patch')(
        {
          account: payload.sendData.account,
          commentId: payload.sendData.commentId,
        },
        () => {
          commit('$_isLikeComment', {
            commentId: payload.sendData.commentId,
            fatherCommentId: payload.sendData.fatherCommentId,
          });
        });
    },
    // 删除评论
    async deleteComment({ commit }, payload: {
      commentId: number;
      fatherCommentId?: number;
    }): Promise<boolean> {
      /**
       * 是否为二级评论
       */
      const isTwoLeveComment: boolean = typeof payload.fatherCommentId === 'number';
      return await $http('/deleteComment', 'delete')(
        { commentId: payload.commentId },
        () => {
          commit('$_deleteComment', {
            isTwoLeveComment,
            commentId: payload.commentId,
            fatherCommentId: isTwoLeveComment ? payload.fatherCommentId : undefined,
        });
      });
    },
  },
}

export default CommentModule