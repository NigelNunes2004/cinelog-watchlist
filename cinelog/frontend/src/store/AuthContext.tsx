import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import * as authApi from '@/api/auth'
import type { AuthUser } from '@/api/auth'
import { tokenStorage } from '@/api/client'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const restoreSession = useCallback(async () => {
    const access = tokenStorage.getAccess()
    const refresh = tokenStorage.getRefresh()

    if (!access && !refresh) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const me = await authApi.getMe()
      setUser(me)
    } catch {
      if (refresh) {
        try {
          const tokens = await authApi.refreshSession(refresh)
          setUser(tokens.user)
        } catch {
          tokenStorage.clear()
          setUser(null)
        }
      } else {
        tokenStorage.clear()
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const login = async (email: string, password: string) => {
    const tokens = await authApi.login({ email, password })
    setUser(tokens.user)
  }

  const signup = async (email: string, password: string, displayName?: string) => {
    const tokens = await authApi.signup({
      email,
      password,
      display_name: displayName,
    })
    setUser(tokens.user)
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
