import type { createApp } from "@vue/runtime-dom";
import axios, { AxiosPromise } from "axios"


export function $axios<T>(
    url: string,
    method: 'get' | 'post' = 'get',
    params?: T): AxiosPromise<any> {
    let $http: AxiosPromise<any>;
    switch (method) {
        case 'get': {
            $http = axios({
                url,
                method,
                params,
            }); break;
        }
        case 'post': {
            $http = axios({
                url,
                method,
                data: params,
            }); break;
        }
    }
    return $http
}

export default {
    install(app: ReturnType<typeof createApp>): void {
        /* 此url会自动加到请求地址的开头 */
        axios.defaults.baseURL = 'http://106.15.200.157:8080';
        /* 设置axios网络超时时间 */
        axios.defaults.timeout = 30000;
        // 请求体中的数据会以普通表单形式（键值对）发送到后端
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

        /* 对返回的数据进行拦截处理 
        axios.interceptors.response.use(res => res.data); */
        app.config.globalProperties.$axios = $axios; // 将axios注入app实例
    }
}