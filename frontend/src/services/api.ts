import axios from 'axios'

export const AUTH_SESSION_EXPIRED_EVENT = 'adoptmascota:session-expired'

export const clienteApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

clienteApi.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }
  return config
})

clienteApi.interceptors.response.use(
  (response) => {
    const body: unknown = response.data
    if (
      body !== null &&
      typeof body === 'object' &&
      'success' in body &&
      'data' in body &&
      typeof body.success === 'boolean'
    ) {
      response.data = body.data
    }
    return response
  },
  (error: unknown) => {
    if (axios.isAxiosError<{ message?: string }>(error) && error.response?.data?.message) {
      error.message = error.response.data.message
    }
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/login') &&
      !error.config?.url?.includes('/auth/logout') &&
      typeof window !== 'undefined'
    ) {
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  },
)
