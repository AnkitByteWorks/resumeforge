import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { useAuth } from '../auth/auth-context'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'
import { ui } from '../ui'

export default function LoginPage() {
  const { user, login } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (user) return <Navigate to={from} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue building your resume.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" type="email" autoComplete="email" required
          value={email} onChange={e => setEmail(e.target.value)} disabled={submitting} />
        <Field label="Password" type="password" autoComplete="current-password" required
          value={password} onChange={e => setPassword(e.target.value)} disabled={submitting} />

        {error && <p role="alert" className={ui.error}>{error}</p>}

        <button type="submit" disabled={submitting} className={`w-full ${ui.primary}`}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className={`mt-6 text-center text-sm ${ui.muted}`}>
        New here? <Link to="/signup" className={ui.link}>Create an account</Link>
      </p>
    </AuthLayout>
  )
}
