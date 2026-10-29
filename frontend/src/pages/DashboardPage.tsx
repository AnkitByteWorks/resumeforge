import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api/client'
import { useAuth } from '../auth/auth-context'
import ThemeToggle from '../components/ThemeToggle'
import type { ResumeSummary } from '../types'
import { ui } from '../ui'

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

  function onDownload(r: ResumeSummary) {
    window.open(`/api/v1/resumes/${r.id}/pdf`, '_blank')
  }

  return (
    <div className={ui.page}>
      <header className={ui.header}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className={ui.brand}>ResumeForge</span>
          <div className="flex items-center gap-4 text-sm">
            <span className={ui.muted}>{user?.name}</span>
            <ThemeToggle />
            <button type="button" onClick={logout} className={ui.secondary}>Log out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-bold ${ui.heading}`}>Your resumes</h2>
          <Link to="/new" className={ui.primary}>Create resume with AI</Link>
        </div>

        {error && <p role="alert" className={`mt-4 ${ui.error}`}>{error}</p>}
        {!error && resumes === null && <p className={`mt-4 text-sm ${ui.muted}`}>Loading...</p>}

        {resumes !== null && resumes.length === 0 && (
          <p className={`mt-4 border border-dashed p-6 text-sm ${ui.card} ${ui.muted}`}>
            No resumes yet. Click "Create resume with AI" to start.
          </p>
        )}

        {resumes !== null && resumes.length > 0 && (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {resumes.map(r => (
              <li key={r.id} className={`p-4 ${ui.card}`}>
                <p className={`font-semibold ${ui.heading}`}>{r.title}</p>
                <p className={`mt-1 text-xs ${ui.muted}`}>
                  Template: {r.templateId}
                  {r.updatedAt ? ` · Updated ${new Date(r.updatedAt).toLocaleDateString()}` : ''}
                </p>
                <button type="button" onClick={() => onDownload(r)} className={`mt-3 ${ui.secondary}`}>
                  Download PDF
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
