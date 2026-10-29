import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, setUnauthorizedHandler, tokenStore } from '../api/client'
import type { AuthResponse, User } from '../types'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // If a token exists we must check it with the server before deciding who is logged in.
  const [loading, setLoading] = useState(() => tokenStore.get() !== null)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStore.clear()
      setUser(null)
    })

    let cancelled = false
    if (tokenStore.get() !== null) {
      api<User>('/api/v1/auth/me')
        .then(u => {
          if (!cancelled) setUser(u)
        })
        .catch(() => tokenStore.clear())
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    })
    tokenStore.set(res.accessToken)
    setUser(res.user)
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await api<AuthResponse>('/api/v1/auth/signup', {
      method: 'POST',
      body: { name, email, password },
      auth: false,
    })
    tokenStore.set(res.accessToken)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
