import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { AppLayout } from '../components/AppLayout'
import { generateDraft, refineDraft, previewHtml, saveResume } from '../api/resumes'
import { cleanDraft } from '../lib/draft'
import type { ResumeDraft } from '../types'

const STEPS = [
  { id: 1, name: 'Describe' },
  { id: 2, name: 'AI Polish' },
  { id: 3, name: 'Editor' },
]

const SAMPLE_CHIPS = [
  'Full-Stack Developer',
  'Recent Graduate',
  'Product Manager',
  'UI/UX Designer',
  'Data Scientist',
]

export function CreateResumePage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 State
  const [rawText, setRawText] = useState('')
  const [targetRole, setTargetRole] = useState('')

  // Step 2 State
  const [questions, setQuestions] = useState<{ question: string; answer: string }[]>([])
  const [draft, setDraft] = useState<ResumeDraft | null>(null)

  // Step 3 State (Editor & Preview)
  const [activeTab, setActiveTab] = useState('experience')
  const [previewHtmlString, setPreviewHtmlString] = useState('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  // --- PREVIEW HANDLER ---
  const updatePreview = async (currentDraft: ResumeDraft) => {
    setIsPreviewLoading(true)
    setPreviewError(null)
    try {
      const cleaned = cleanDraft(currentDraft)
      const html = await previewHtml(cleaned)
      const styledHtml = html.includes('</head>')
        ? html.replace(
            '</head>',
            '<style>:root{color-scheme:light}html{background:#fff}body{padding:10mm 12mm;box-sizing:border-box}</style></head>',
          )
        : `
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; background: white; }
          h1 { text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
          h2 { font-size: 14px; text-transform: uppercase; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 20px; }
          ul { padding-left: 20px; }
        </style>
        ${html}
      `
      setPreviewHtmlString(styledHtml)
    } catch (err: unknown) {
      console.error('Preview error', err)
      const msg = err instanceof Error ? err.message : 'Failed to generate live preview'
      setPreviewError(msg)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  // Ensure preview is generated when entering Step 3
  useEffect(() => {
    if (currentStep === 3 && draft && !previewHtmlString && !isPreviewLoading && !previewError) {
      void updatePreview(draft)
    }
  }, [currentStep, draft, previewHtmlString, isPreviewLoading, previewError])

  // --- API HANDLERS ---
  const handleGenerate = async () => {
    if (!rawText.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await generateDraft({
        text: rawText,
        targetRole,
        jobDescription: '',
      })

      const generatedDraft = response.draft ?? response.resume
      setDraft(generatedDraft)

      if (response.questions && response.questions.length > 0) {
        setQuestions(
          response.questions.map((q: { question?: string } | string) => ({
            question: typeof q === 'string' ? q : q.question || '',
            answer: '',
          })),
        )
      } else {
        setQuestions([
          { question: 'What was your biggest technical achievement at your last role?', answer: '' },
          { question: 'How many people were on your team, and what was your specific contribution?', answer: '' },
          { question: 'Do you have any specific metrics or numbers to quantify your impact?', answer: '' },
        ])
      }

      setCurrentStep(2)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate resume.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefine = async () => {
    if (!draft) return
    setIsLoading(true)
    setError(null)

    try {
      const refined = await refineDraft({
        text: rawText,
        targetRole,
        jobDescription: '',
        draft,
        answers: questions,
      })

      const refinedDraft = (refined.draft ?? refined.resume ?? refined) as ResumeDraft
      setDraft(refinedDraft)
      setCurrentStep(3)
      void updatePreview(refinedDraft)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to refine resume.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!draft) return
    setIsLoading(true)
    try {
      await saveResume(cleanDraft(draft))
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save resume.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDraftChange = (updatedDraft: ResumeDraft) => {
    setDraft(updatedDraft)
    void updatePreview(updatedDraft)
  }

  const updateQuestionAnswer = (idx: number, val: string) => {
    const newQs = [...questions]
    newQs[idx].answer = val
    setQuestions(newQs)
  }

  // --- RENDER STEP 1 ---
  const renderStep1 = () => (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-medium tracking-tight text-white mb-4">
          Let&apos;s build your <span className="text-[#84cc16]">perfect resume.</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          Paste your current resume, a rough draft, or just brain-dump your experience.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              What role are you targeting? (Optional)
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full bg-black/40 border border-zinc-800 text-white rounded-lg px-4 py-3 outline-none focus:border-[#84cc16] focus:ring-1 focus:ring-[#84cc16] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Your Experience &amp; Skills
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={8}
              placeholder="I have 5 years of experience building React apps. I worked at Google as a UI Engineer..."
              className="w-full bg-black/40 border border-zinc-800 text-white rounded-lg px-4 py-3 outline-none focus:border-[#84cc16] focus:ring-1 focus:ring-[#84cc16] transition-all resize-none"
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold">
              Quick Start Examples
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_CHIPS.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => setTargetRole(chip)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-300 hover:bg-[#84cc16]/10 hover:border-[#84cc16]/30 hover:text-[#84cc16] transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!rawText.trim() || isLoading}
            className="bg-[#84cc16] hover:bg-[#65a30d] text-black font-semibold px-8 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate with AI
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  // --- RENDER STEP 2 ---
  const renderStep2 = () => (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-medium tracking-tight text-white mb-2">
          Let&apos;s make it <span className="text-[#84cc16]">stand out.</span>
        </h2>
        <p className="text-zinc-400">The AI needs a bit more detail to write impactful bullet points.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-[#84cc16]/30 transition-colors"
          >
            <label className="block text-sm font-medium text-white mb-3">
              {q.question}
            </label>
            <textarea
              value={q.answer}
              onChange={(e) => updateQuestionAnswer(idx, e.target.value)}
              rows={2}
              placeholder="Type your answer here..."
              className="w-full bg-black/40 border border-zinc-800 text-white rounded-lg px-4 py-3 outline-none focus:border-[#84cc16] focus:ring-1 focus:ring-[#84cc16] transition-all resize-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          ← Back to description
        </button>
        <button
          type="button"
          onClick={handleRefine}
          disabled={isLoading}
          className="bg-[#84cc16] hover:bg-[#65a30d] text-black font-semibold px-8 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Refining...
            </>
          ) : (
            <>
              Refine with AI
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )

  // --- RENDER STEP 3 (Split Screen Editor) ---
  const renderStep3 = () => {
    if (!draft) return null

    const pInfo = draft.personalInfo ?? {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
    }

    return (
      <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-[calc(100vh-140px)] flex gap-6">
        {/* Left Side: Editor */}
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto pr-2 pb-10 custom-scrollbar">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-medium text-white">Editor</h2>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="bg-[#84cc16] hover:bg-[#65a30d] text-black text-sm font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Resume'}
            </button>
          </div>

          {/* Accordions */}
          {['Personal Info', 'Experience', 'Education', 'Skills'].map((section) => {
            const tabKey = section.toLowerCase().split(' ')[0]
            const isActive = activeTab === tabKey
            return (
              <div
                key={section}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveTab(isActive ? '' : tabKey)}
                  className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span className="font-medium text-white">{section}</span>
                  <svg
                    className={`w-4 h-4 text-zinc-400 transition-transform ${isActive ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isActive && (
                  <div className="p-4 border-t border-white/5 bg-black/20">
                    {section === 'Personal Info' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={pInfo.fullName || ''}
                            onChange={(e) =>
                              handleDraftChange({
                                ...draft,
                                personalInfo: { ...pInfo, fullName: e.target.value },
                              })
                            }
                            className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:border-[#84cc16] outline-none"
                            placeholder="Full Name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={pInfo.email || ''}
                            onChange={(e) =>
                              handleDraftChange({
                                ...draft,
                                personalInfo: { ...pInfo, email: e.target.value },
                              })
                            }
                            className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:border-[#84cc16] outline-none"
                            placeholder="Email"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                              Phone
                            </label>
                            <input
                              type="text"
                              value={pInfo.phone || ''}
                              onChange={(e) =>
                                handleDraftChange({
                                  ...draft,
                                  personalInfo: { ...pInfo, phone: e.target.value },
                                })
                              }
                              className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:border-[#84cc16] outline-none"
                              placeholder="+1 234 567 8900"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                              Location
                            </label>
                            <input
                              type="text"
                              value={pInfo.location || ''}
                              onChange={(e) =>
                                handleDraftChange({
                                  ...draft,
                                  personalInfo: { ...pInfo, location: e.target.value },
                                })
                              }
                              className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:border-[#84cc16] outline-none"
                              placeholder="City, State"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {section === 'Experience' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                            Professional Summary
                          </label>
                          <textarea
                            value={draft.summary || ''}
                            onChange={(e) =>
                              handleDraftChange({
                                ...draft,
                                summary: e.target.value,
                              })
                            }
                            rows={3}
                            className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:border-[#84cc16] outline-none resize-none"
                            placeholder="Professional Summary"
                          />
                        </div>

                        {(draft.experience || []).map((exp, expIdx) => (
                          <div key={expIdx} className="p-3 bg-white/5 rounded border border-white/5 space-y-2">
                            <input
                              type="text"
                              value={exp.role || ''}
                              onChange={(e) => {
                                const newExp = [...(draft.experience || [])]
                                newExp[expIdx] = { ...newExp[expIdx], role: e.target.value }
                                handleDraftChange({ ...draft, experience: newExp })
                              }}
                              className="w-full bg-black/40 border border-zinc-800 rounded px-2 py-1 text-sm text-white focus:border-[#84cc16] outline-none"
                              placeholder="Job Title / Role"
                            />
                            <input
                              type="text"
                              value={exp.company || ''}
                              onChange={(e) => {
                                const newExp = [...(draft.experience || [])]
                                newExp[expIdx] = { ...newExp[expIdx], company: e.target.value }
                                handleDraftChange({ ...draft, experience: newExp })
                              }}
                              className="w-full bg-black/40 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:border-[#84cc16] outline-none"
                              placeholder="Company"
                            />

                            <div className="space-y-1.5 mt-2">
                              {(exp.bullets || []).map((bullet: string, bIdx: number) => (
                                <input
                                  key={bIdx}
                                  type="text"
                                  value={bullet}
                                  onChange={(e) => {
                                    const newBullets = [...(exp.bullets || [])]
                                    newBullets[bIdx] = e.target.value
                                    const newExp = [...(draft.experience || [])]
                                    newExp[expIdx] = { ...newExp[expIdx], bullets: newBullets }
                                    handleDraftChange({ ...draft, experience: newExp })
                                  }}
                                  className="w-full bg-black/40 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:border-[#84cc16] outline-none"
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section === 'Skills' && (
                      <div className="flex flex-wrap gap-2">
                        {(draft.skills || []).map((skill: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/20 rounded text-xs font-mono"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {section === 'Education' && (
                      <div className="space-y-3">
                        {(draft.education || []).length > 0 ? (
                          (draft.education || []).map((edu, eduIdx) => (
                            <div key={eduIdx} className="p-3 bg-white/5 rounded border border-white/5 space-y-1">
                              <p className="text-sm text-white font-medium">
                                {edu.degree} in {edu.field}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {edu.institution} ({edu.startDate} - {edu.endDate})
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-zinc-500 italic">No education listed in draft.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right Side: Live Preview (Iframe) */}
        <div className="w-1/2 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col relative">
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full z-10 flex items-center gap-2">
            {isPreviewLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Rendering...
              </>
            ) : (
              'Live Preview'
            )}
          </div>

          {previewHtmlString ? (
            <iframe
              srcDoc={previewHtmlString}
              className="w-full h-full border-0 bg-white"
              title="Resume Preview"
            />
          ) : previewError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-600">
              <p className="text-sm text-red-500 mb-3">{previewError}</p>
              <button
                type="button"
                onClick={() => draft && void updatePreview(draft)}
                className="px-4 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors cursor-pointer"
              >
                Retry Preview
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <div className="w-5 h-5 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Generating preview...</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto w-full pt-6 pb-6">
        {currentStep < 3 && (
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300 ${
                      currentStep === step.id
                        ? 'bg-[#84cc16] text-black shadow-[0_0_15px_rgba(132,204,22,0.5)]'
                        : currentStep > step.id
                          ? 'bg-[#84cc16]/20 text-[#84cc16]'
                          : 'bg-white/5 text-zinc-500 border border-white/10'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium hidden sm:block ${
                      currentStep === step.id ? 'text-white' : 'text-zinc-500'
                    }`}
                  >
                    {step.name}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`w-8 sm:w-12 h-[1px] mx-2 sm:mx-4 ${
                        currentStep > step.id ? 'bg-[#84cc16]/50' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </AppLayout>
  )
}

export default CreateResumePage
