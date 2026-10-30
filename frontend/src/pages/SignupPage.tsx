import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../auth/auth-context'
import { AuthLayout } from '../components/AuthLayout'

export function SignupPage() {
  const { user, signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await signup(name, email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-medium tracking-tight text-white mb-2">
          Create your account
        </h1>
        <p className="text-zinc-400 text-sm">
          Start building an ATS-friendly resume in minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Full Name
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-[#84cc16] focus:ring-1 focus:ring-[#84cc16] transition-all"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-[#84cc16] focus:ring-1 focus:ring-[#84cc16] transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Password (min. 8 characters)
          </label>
          <input
            type="password"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-[#84cc16] focus:ring-1 focus:ring-[#84cc16] transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#84cc16] hover:bg-[#65a30d] text-black font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{' '}
        <Link to="/login" className="text-[#84cc16] hover:text-[#a3e635] font-medium transition-colors">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}

export default SignupPage
