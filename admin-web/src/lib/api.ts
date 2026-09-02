import axios, { type InternalAxiosRequestConfig } from 'axios'

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

let refreshPromise: Promise<unknown> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableConfig | undefined
    // A failing refresh call must reject immediately — retrying it would await
    // refreshPromise from inside the very call that promise is waiting on (deadlock).
    const isRefreshCall = config?.url?.includes('/auth/refresh')
    if (error.response?.status !== 401 || !config || config._retry || isRefreshCall) {
      return Promise.reject(error)
    }
    config._retry = true

    // ponytail: single in-flight refresh shared by all callers, avoids a refresh-storm on concurrent 401s
    refreshPromise ??= api.post('/auth/refresh').finally(() => {
      refreshPromise = null
    })

    try {
      await refreshPromise
      return api(config)
    } catch {
      return Promise.reject(error)
    }
  },
)
