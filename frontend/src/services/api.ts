import axios from 'axios'

const TOKEN_STORAGE_KEY = 'adoptmascota_token'

export const tokenStorage = {
  get: () => (typeof window === 'undefined' ? null : window.sessionStorage.getItem(TOKEN_STORAGE_KEY)),
  set: (token: string) => window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token),
  clear: () => window.sessionStorage.removeItem(TOKEN_STORAGE_KEY),
}

export const clienteApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

clienteApi.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
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
    return Promise.reject(error)
  },
)
