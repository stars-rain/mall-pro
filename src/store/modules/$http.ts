import { $axios } from '@/plugins/axios'

/**
* 对购物车操作请求的一个封装
* @param url - 请求地址 
* @param methods - 请求方法
* @returns 返回一个接受请求参数、请求成功的回调函数这两个参数的函数(请求主体在这函数里面)
*/
const $http: (url: string, methods: 'patch' | 'delete' | 'post' | 'get') =>
 <T>(params: T, callback?: (...arg: any[]) => any) =>
   Promise<boolean> = (url: string, methods: 'patch' | 'delete' | 'post' | 'get'):
   <T>(params: T, callback?: (...arg: any[]) => any) =>
   Promise<boolean> => {
   return <T>(params: T, callback?: (...arg: any[]) => any): Promise<boolean> => {
     return new Promise<boolean>((resolve, reject) => {
       $axios([url, methods, params]).then(res => {
         if (res.data.status === 'success') {
           if (typeof callback !== 'undefined') {
              switch(url) {
                case '/getCart': callback(res.data.messages.cart);break;
                case '/addComment': case '/addReplayComment': callback(res.data.messages.id);break;
                case '/getComment': case '/getReplayComment': callback(res.data.messages.comments);break;
                default: callback();
              }
            } // 执行回调函数
           resolve(true);
         } else {
           console.log(res.data.reason);
           reject(false);
         }
       }).catch(error => {
         console.log(error);
         reject(false);
       })
     })
   }
 }

 export default $http