import axios from "axios"

export default {
    install(): void {
        /* 此url会自动加到请求地址的开头 */
        axios.defaults.baseURL = 'http://106.15.200.157:8080';
        /* 设置axios网络超时时间 */
        axios.defaults.timeout = 30000;
        /* 对返回的数据进行拦截处理 
        axios.interceptors.response.use(res => res.data); */
    }
}