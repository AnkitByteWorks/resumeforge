import { useEffect, useState } from 'react'
import { errorMessage } from '../api/client'
import { previewHtml } from '../api/resumes'
import { cleanDraft } from '../lib/draft'
import type { ResumeDraft } from '../types'
import { ui } from '../ui'

// Browsers ignore @page margins inside an iframe, so we add page padding for the preview only.
// The paper stays white even in dark mode, because the PDF is white.
const PAGE_PADDING =
  '<style>:root{color-scheme:light}html{background:#fff}body{padding:14mm 16mm;box-sizing:border-box}</style></head>'

export default function ResumePreview({ draft }: { draft: ResumeDraft }) {
  const [html, setHtml] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      previewHtml(cleanDraft(draft))
        .then(h => {
          if (!cancelled) {
            setHtml(h)
            setError('')
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) setError(errorMessage(err, 'Preview failed'))
        })
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [draft])

  return (
    <div>
      {error && (
        <p role="alert" className={`mb-3 ${ui.error}`}>
          {error}
        </p>
      )}
      <iframe
        title="Resume preview"
        sandbox=""
        srcDoc={html.replace('</head>', PAGE_PADDING)}
        className="mx-auto block h-[1123px] w-[794px] max-w-full bg-white shadow-lg"
      />
    </div>
  )
}
