import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, setUnauthorizedHandler, tokenStore } from '../api/client'
import type { AuthResponse, User } from '../types'
import { AuthContext, type LoginCredentials, type SignupCredentials } from './auth-context'

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

  const login = useCallback(
    async (emailOrCreds: string | LoginCredentials, pwd?: string) => {
      const email = typeof emailOrCreds === 'object' ? emailOrCreds.email : emailOrCreds
      const password = typeof emailOrCreds === 'object' ? emailOrCreds.password : (pwd ?? '')
      const res = await api<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: { email: email.trim(), password },
        auth: false,
      })
      tokenStore.set(res.accessToken)
      setUser(res.user)
    },
    [],
  )

  const signup = useCallback(
    async (nameOrCreds: string | SignupCredentials, em?: string, pwd?: string) => {
      const name = typeof nameOrCreds === 'object' ? nameOrCreds.name : nameOrCreds
      const email = typeof nameOrCreds === 'object' ? nameOrCreds.email : (em ?? '')
      const password = typeof nameOrCreds === 'object' ? nameOrCreds.password : (pwd ?? '')
      const res = await api<AuthResponse>('/api/v1/auth/signup', {
        method: 'POST',
        body: { name: name.trim(), email: email.trim(), password },
        auth: false,
      })
      tokenStore.set(res.accessToken)
      setUser(res.user)
    },
    [],
  )

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
