import axios from 'axios'
import { useGlobalState } from '@/hooks/use-global-state'
import { toast } from 'vue-sonner'
import { config } from './config'

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
  baseURL: config('baseUrl'),
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
  async (error: any) => {
    const refreshToken = async () => {
      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        throw new Error('Refresh token not found')
      }

      try {
        const res = await axios.post(
          '/api/auth/refresh',
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          }
        )

        return res.data.data
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')

        window.location.href = '/'
        return Promise.reject(error)
      }
    }

    const originalRequest = error.config
    if (error.response.data.code === 401) {
      const newAccessToken = await refreshToken()

      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
      const res = await axios(originalRequest)

      if (res.data.code === 200) {
        return res.data
      } else {
        return Promise.reject(res.data.message)
      }
    }

    toast.warning(error.response.data.message)
    return Promise.reject(error.response.data.message)
  }
)

export default service
