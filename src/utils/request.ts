import axios from 'axios'
import { useGlobalState } from '@/hooks/use-global-state'
import { toast } from 'vue-sonner'

function tansParams(params: any) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = encodeURIComponent(propName) + '='

    if (value === null || value === '' || typeof value === 'undefined') {
      continue
    }

    if (typeof value === 'object') {
      for (const key of Object.keys(value)) {
        if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
          const params = propName + '[' + key + ']'
          const subPart = encodeURIComponent(params) + '='
          result += subPart + encodeURIComponent(value[key]) + '&'
        }
      }
    } else {
      result += part + encodeURIComponent(value) + '&'
    }
  }
  return result
}

let service: ReturnType<typeof axios.create>

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建 axios 实例
service = axios.create({
  // axios 中请求配置有 baseURL 选项，表示请求 URL 公共部分
  baseURL: '/api',
  // 超时
  timeout: 15000
})

// 请求拦截
service.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token // 让每个请求携带自定义 token 请根据实际情况自行修改
    }

    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params)
      url = url.slice(0, -1)
      config.params = {}
      config.url = url
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)
// 响应拦截
service.interceptors.response.use(
  (response: any) => {
    const responseBody = response.data

    if (responseBody.code === 200) {
      response = responseBody
      return response
    } else {
      throw new Error(responseBody.message)
    }
  },
  (error: any) => {
    toast.warning(error.message)

    if (error.response.data.code === 401) {
      const { globalState } = useGlobalState()

      localStorage.removeItem('token')
      globalState.value.isLoggin = false
    }
    return Promise.reject(error)
  }
)

export default service
