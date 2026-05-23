import axios from 'axios'

const ACCESS_KEY = 'cinelog_access_token'
const REFRESH_KEY = 'cinelog_refresh_token'

export const tokenStorage = {
  getAccess: () => (typeof window !== 'undefined' ? localStorage.getItem(ACCESS_KEY) : null),
  getRefresh: () => (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null),
  setTokens: (access: string, refresh: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean }
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    const url = original.url ?? ''
    if (url.includes('/auth/login') || url.includes('/auth/signup') || url.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    original._retry = true
    const refreshToken = tokenStorage.getRefresh()
    if (!refreshToken) {
      tokenStorage.clear()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth'
      }
      return Promise.reject(error)
    }

    if (!refreshPromise) {
      refreshPromise = axios
        .post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })
        .then((res) => {
          tokenStorage.setTokens(res.data.access_token, res.data.refresh_token)
          return res.data.access_token as string
        })
        .catch(() => {
          tokenStorage.clear()
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
            window.location.href = '/auth'
          }
          return null
        })
        .finally(() => {
          refreshPromise = null
        })
    }

    const newAccess = await refreshPromise
    if (!newAccess) return Promise.reject(error)

    original.headers.Authorization = `Bearer ${newAccess}`
    return api(original)
  },
)
