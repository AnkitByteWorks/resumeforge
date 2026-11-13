import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router'
import { fetchPublicResume } from '../api/resumes'
import type { PublicResumeDto } from '../types'

export function PublicResumePage() {
  const { slug } = useParams<{ slug: string }>()
  const [data, setData] = useState<PublicResumeDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Virtual A4 live responsive scaling
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0.85)

  useEffect(() => {
    if (!slug) return
    setIsLoading(true)
    fetchPublicResume(slug)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'This resume is private or does not exist.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [slug])

  useEffect(() => {
    if (!previewContainerRef.current) return
    const updateScale = () => {
      if (!previewContainerRef.current) return
      const width = previewContainerRef.current.clientWidth
      // 794px is standard A4 paper width at 96 DPI
      const calculatedScale = Math.min(1.05, Math.max(0.4, (width - 40) / 794))
      setPreviewScale(calculatedScale)
    }
    updateScale()
    const observer = new ResizeObserver(() => updateScale())
    observer.observe(previewContainerRef.current)
    return () => observer.disconnect()
  }, [data])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-zinc-400">Loading candidate profile...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl mb-4 shadow-xl">
          🔒
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Resume is Private</h1>
        <p className="text-zinc-400 text-sm max-w-md mb-6 leading-relaxed">
          The candidate has set this resume to private or the share link has been revoked.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-[#84cc16] hover:bg-[#65a30d] text-black font-semibold text-xs rounded-xl transition-all shadow-lg shadow-[#84cc16]/20"
        >
          Create Your Own Resume on ResumeForge →
        </Link>
      </div>
    )
  }

  const pInfo = data.personalInfo || {}

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans">
      {/* Sticky Recruiter Header */}
      <header className="sticky top-0 z-40 bg-[#111114]/90 backdrop-blur-md border-b border-white/10 px-6 py-3.5 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#84cc16] to-emerald-400 flex items-center justify-center text-black font-black text-sm shadow">
                R
              </div>
              <span className="font-bold text-sm text-white tracking-tight group-hover:text-[#84cc16] transition-colors">
                ResumeForge
              </span>
            </Link>
            <span className="text-zinc-600">|</span>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                {pInfo.fullName || 'Candidate Profile'}
              </h2>
              {pInfo.headline && (
                <p className="text-[11px] text-zinc-400 leading-none truncate max-w-xs sm:max-w-md">
                  {pInfo.headline}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {pInfo.email && (
              <a
                href={`mailto:${pInfo.email}`}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                title="Email candidate"
              >
                <span>✉️</span>
                <span className="hidden md:inline">Contact</span>
              </a>
            )}
            {pInfo.linkedin && (
              <a
                href={pInfo.linkedin.startsWith('http') ? pInfo.linkedin : `https://${pInfo.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                title="LinkedIn Profile"
              >
                <span>in</span>
                <span className="hidden md:inline">LinkedIn</span>
              </a>
            )}
            <a
              href={`/api/v1/public/resumes/${slug}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1.5 bg-[#84cc16] hover:bg-[#65a30d] text-black font-semibold text-xs rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>⬇️</span>
              <span>Download PDF</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col items-center">
        <div
          ref={previewContainerRef}
          className="w-full flex justify-center py-4 overflow-x-hidden"
        >
          <div
            style={{
              width: `${794 * previewScale}px`,
              height: `${1123 * previewScale}px`,
              position: 'relative',
              flexShrink: 0,
              transition: 'width 0.15s ease-out, height 0.15s ease-out',
            }}
            className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] rounded-sm overflow-hidden bg-white border border-white/20"
          >
            <iframe
              srcDoc={data.renderedHtml}
              style={{
                width: '794px',
                height: '1123px',
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                border: 'none',
                background: '#ffffff',
                display: 'block',
              }}
              title={`${pInfo.fullName || 'Candidate'} Resume`}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 bg-[#0d0d10] text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Official candidate profile hosted on ResumeForge</span>
          <Link to="/" className="text-[#84cc16] hover:underline font-medium">
            Build your own ATS-optimized resume for free →
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default PublicResumePage
