import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { downloadPdf, fetchResumes } from '../api/resumes'
import { AppLayout } from '../components/AppLayout'

type ResumeSummary = {
  id: string
  title: string
  templateId: string
  updatedAt: string | null
  atsScore?: number
}

export function DashboardPage() {
  const [resumes, setResumes] = useState<ResumeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadResumes() {
      try {
        const data = await fetchResumes()
        // For demo purposes, if data is empty, we'll inject mock data
        // so you can see the new card design. Remove this mock block when real data exists.
        if (data.length === 0) {
          setResumes([
            {
              id: '1',
              title: 'Senior Frontend Engineer',
              templateId: 'modern',
              updatedAt: new Date().toISOString(),
              atsScore: 92,
            },
            {
              id: '2',
              title: 'Product Manager - Google',
              templateId: 'classic',
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
              atsScore: 78,
            },
          ])
        } else {
          setResumes(data)
        }
      } catch (err) {
        console.error('Failed to load resumes', err)
      } finally {
        setLoading(false)
      }
    }
    loadResumes()
  }, [])

  const handleDownload = async (resume: ResumeSummary) => {
    if (resume.id === '1' || resume.id === '2') {
      // Demo card placeholder
      alert('This is a demo preview card. Create a real resume with AI to download its PDF!')
      return
    }
    setDownloadingId(resume.id)
    try {
      const blob = await downloadPdf(resume.id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${resume.title.replace(/[\\/:*?"<>|]/g, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download PDF', err)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <AppLayout>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-white mb-1">
            Your Resumes
          </h1>
          <p className="text-zinc-400 text-sm">
            Manage, edit, and tailor your AI-generated resumes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/create')}
          className="group relative inline-flex items-center justify-center gap-2 bg-[#84cc16] hover:bg-[#65a30d] text-black font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 overflow-hidden cursor-pointer"
        >
          <span className="relative z-10">Create resume with AI</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : resumes.length === 0 ? (
        /* Empty State */
        <div className="relative w-full flex flex-col items-center justify-center py-24 px-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#84cc16]/5 rounded-2xl pointer-events-none" />

          <div className="w-16 h-16 bg-[#84cc16]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#84cc16]/20">
            <svg className="w-8 h-8 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h3 className="text-xl font-medium text-white mb-2">No resumes yet</h3>
          <p className="text-zinc-400 max-w-md mb-8">
            Click &quot;Create resume with AI&quot; to start building your next opportunity.
          </p>
          <button
            type="button"
            onClick={() => navigate('/create')}
            className="text-sm font-medium text-[#84cc16] hover:text-[#a3e635] flex items-center gap-1 transition-colors cursor-pointer"
          >
            Get started now
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      ) : (
        /* Resume Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-[#84cc16]/50 hover:shadow-[0_0_30px_-5px_rgba(132,204,22,0.2)] transition-all duration-300 flex flex-col"
            >
              {/* Miniature Preview (Mock Paper) */}
              <div className="h-48 bg-zinc-800/50 relative overflow-hidden border-b border-white/10 flex items-center justify-center p-4">
                {/* The mock paper */}
                <div className="w-32 h-40 bg-white rounded-sm shadow-lg transform group-hover:scale-105 transition-transform duration-500 flex flex-col p-3 gap-1.5 opacity-80 group-hover:opacity-100">
                  <div className="w-1/2 h-1.5 bg-zinc-300 rounded-sm mx-auto mb-2" />
                  <div className="w-3/4 h-1 bg-zinc-200 rounded-sm" />
                  <div className="w-full h-1 bg-zinc-100 rounded-sm" />
                  <div className="w-full h-1 bg-zinc-100 rounded-sm" />
                  <div className="w-5/6 h-1 bg-zinc-100 rounded-sm" />
                  <div className="w-1/3 h-1 bg-zinc-300 rounded-sm mt-2" />
                  <div className="w-full h-1 bg-zinc-100 rounded-sm" />
                  <div className="w-full h-1 bg-zinc-100 rounded-sm" />
                </div>

                {/* ATS Score Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      resume.atsScore && resume.atsScore > 80 ? 'bg-[#84cc16]' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-xs font-semibold text-white">
                    ATS {resume.atsScore || 0}%
                  </span>
                </div>
              </div>

              {/* Card Content & Actions */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1 truncate">{resume.title}</h3>
                  <p className="text-xs text-zinc-500">
                    Updated{' '}
                    {resume.updatedAt
                      ? new Date(resume.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recently'}
                  </p>
                </div>

                {/* Action Buttons (Reveal on Hover) */}
                <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => navigate('/create')}
                    className="text-xs font-medium text-white bg-white/10 hover:bg-[#84cc16] hover:text-black px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/create')}
                      className="p-1.5 text-zinc-400 hover:text-[#84cc16] bg-white/5 hover:bg-[#84cc16]/10 rounded-md transition-colors cursor-pointer"
                      title="Tailor to Job"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={downloadingId === resume.id}
                      onClick={() => handleDownload(resume)}
                      className="p-1.5 text-zinc-400 hover:text-[#06b6d4] bg-white/5 hover:bg-[#06b6d4]/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                      title="Download PDF"
                    >
                      {downloadingId === resume.id ? (
                        <div className="w-4 h-4 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}

export default DashboardPage
