import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/auth-context'
import type { ResumeSummary } from '../types'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api<ResumeSummary[]>('/api/v1/resumes')
      .then(list => {
        if (!cancelled) setResumes(list)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load resumes')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold text-blue-700">ResumeForge</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600">{user?.name}</span>
            <button type="button" onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h2 className="text-xl font-bold text-slate-900">Your resumes</h2>

        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {!error && resumes === null && <p className="mt-4 text-sm text-slate-500">Loading...</p>}

        {resumes !== null && resumes.length === 0 && (
          <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            No resumes yet. The AI resume builder arrives in the next step.
          </p>
        )}

        {resumes !== null && resumes.length > 0 && (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {resumes.map(r => (
              <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-slate-900">{r.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Template: {r.templateId}
                  {r.updatedAt ? ` · Updated ${new Date(r.updatedAt).toLocaleDateString()}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
