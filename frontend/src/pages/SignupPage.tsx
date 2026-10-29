import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../auth/auth-context'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'
import { ui } from '../ui'

export default function SignupPage() {
  const { user, signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    try {
      await signup(name.trim(), email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start building an ATS-friendly resume in minutes.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Name" type="text" autoComplete="name" required maxLength={100}
          value={name} onChange={e => setName(e.target.value)} disabled={submitting} />
        <Field label="Email" type="email" autoComplete="email" required
          value={email} onChange={e => setEmail(e.target.value)} disabled={submitting} />
        <Field label="Password (8 to 72 characters)" type="password" autoComplete="new-password"
          required minLength={8} maxLength={72}
          value={password} onChange={e => setPassword(e.target.value)} disabled={submitting} />

        {error && <p role="alert" className={ui.error}>{error}</p>}

        <button type="submit" disabled={submitting} className={`w-full ${ui.primary}`}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className={`mt-6 text-center text-sm ${ui.muted}`}>
        Already have an account? <Link to="/login" className={ui.link}>Log in</Link>
      </p>
    </AuthLayout>
  )
}
