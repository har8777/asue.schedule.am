import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { HTTP_CLIENT_CONSTANTS } from './http-client.constants'

/**
 * Creates and configures the Axios instance conforming to SOLID principles.
 * DIP: Callers depend on this abstracted Axios client rather than native fetch or global axios.
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: HTTP_CLIENT_CONSTANTS.BASE_URL,
  timeout: HTTP_CLIENT_CONSTANTS.TIMEOUT_MS,
  headers: {
    'Content-Type': HTTP_CLIENT_CONSTANTS.HEADERS.CONTENT_TYPE,
    Accept: HTTP_CLIENT_CONSTANTS.HEADERS.ACCEPT,
  },
})

// Request interceptor: attach bearer token if exists
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(HTTP_CLIENT_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor: handle unified error logging and token expiration
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[HTTP Client] Unauthorized request - session expired or invalid credentials')
    }
    return Promise.reject(error)
  }
)
