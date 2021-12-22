import type { createApp } from "@vue/runtime-dom";
import axios from "axios"
import type { AxiosPromise, ResponseType } from "axios"

type AxiosArg<T> = [string, ('get' | 'post' | 'put' | 'delete' | 'patch')?, T?, ResponseType?, string?];

const CancelToken = axios.CancelToken;
const source = CancelToken.source();
/**
 * 对axios进行再次封装
 * @param {string} args - 元组类型，请求体的各项参数，依次是请求地址、请求方法(可选默认为get)、发送的参数(可选)、数据相应的类型(可选默认为json)、默认接口地址前缀(可选默认为/api)
 */
export function $axios<T>(args: AxiosArg<T>): AxiosPromise<any> {
    let $http: AxiosPromise<any>;
    const [url, method = 'get', params, responseType = 'json', baseURL = '/api'] = args;
    switch (method) {
        case 'get': case 'delete': {
            $http = axios({
                url,
                method,
                params,
                baseURL,
            }); break;
        }
        case 'post': case 'put': case 'patch': {
            $http = axios({
                url,
                method,
                data: params,
                responseType,
                baseURL,
                cancelToken: url === '/getReplayComment' ? source.token : undefined,
            }); break;
        }
    }
    return $http
}

export { source }

export default {
    install(app: ReturnType<typeof createApp>): void {
        /* 此url会自动加到请求地址的开头 */
        // axios.defaults.baseURL = '/api';
        /* 设置axios网络超时时间 */
        axios.defaults.timeout = 20000;
        // 请求体中的数据会以普通表单形式（键值对）发送到后端
        // axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

        /* 对返回的数据进行拦截处理 
        axios.interceptors.response.use(res => res.data); */
        app.config.globalProperties.$axios = $axios; // 将axios注入app实例
    }
}