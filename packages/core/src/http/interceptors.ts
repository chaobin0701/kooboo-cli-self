// packages/core/http/interceptors.ts
import { AxiosInstance, AxiosError } from 'axios'
import { koobooContext } from '../config/context.js'

export function setupInterceptors(client: AxiosInstance): void {
  // 请求拦截器 - 添加token
  client.interceptors.request.use(
    config => {
      const { token } = koobooContext.getConfig()

      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`
      }

      return config
    },
    error => Promise.reject(error)
  )

  // 响应拦截器 - 处理token过期
  client.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      console.error(error.response?.data)
      return Promise.reject(error)
    }
  )
}
