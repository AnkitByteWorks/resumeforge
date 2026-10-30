import { createContext, useContext } from 'react'
import type { User } from '../types'

export type LoginCredentials = { email: string; password: string }
export type SignupCredentials = { name: string; email: string; password: string }

export interface AuthState {
  user: User | null
  loading: boolean
  login: (emailOrCreds: string | LoginCredentials, password?: string) => Promise<void>
  signup: (nameOrCreds: string | SignupCredentials, email?: string, password?: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
