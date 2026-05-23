import { api, tokenStorage } from './client'

export interface AuthUser {
  id: number
  email: string
  display_name: string | null
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

export const signup = async (data: {
  email: string
  password: string
  display_name?: string
}): Promise<TokenResponse> => {
  const res = await api.post<TokenResponse>('/auth/signup', data)
  tokenStorage.setTokens(res.data.access_token, res.data.refresh_token)
  return res.data
}

export const login = async (data: {
  email: string
  password: string
}): Promise<TokenResponse> => {
  const res = await api.post<TokenResponse>('/auth/login', data)
  tokenStorage.setTokens(res.data.access_token, res.data.refresh_token)
  return res.data
}

export const refreshSession = async (refreshToken: string): Promise<TokenResponse> => {
  const res = await api.post<TokenResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  })
  tokenStorage.setTokens(res.data.access_token, res.data.refresh_token)
  return res.data
}

export const logout = async (): Promise<void> => {
  const refreshToken = tokenStorage.getRefresh()
  try {
    if (refreshToken) {
      await api.post('/auth/logout', { refresh_token: refreshToken })
    }
  } finally {
    tokenStorage.clear()
  }
}

export const getMe = async (): Promise<AuthUser> => {
  const res = await api.get<AuthUser>('/auth/me')
  return res.data
}
