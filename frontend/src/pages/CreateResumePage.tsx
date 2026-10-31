import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { AppLayout } from '../components/AppLayout'
import {
  generateDraft,
  refineDraft,
  previewHtml,
  saveResume,
  enhanceBullet,
  tailorDraft,
  checkDraftAts,
} from '../api/resumes'
import { cleanDraft } from '../lib/draft'
import type { ResumeDraft, EnhanceBulletResponse, TailorResumeResponse, AtsReport } from '../types'

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

const TEMPLATE_OPTIONS: Array<{
  id: string
  name: string
  color: string
  category: 'ATS Standard' | 'Photo & Creative' | 'Split Layout' | 'Modern Minimalist'
  hasPhoto: boolean
  desc: string
}> = [
  // User Reference Templates (Exact to exact matches)
  { id: 'foundation-purple', name: 'Foundation Purple', color: '#4a2c82', category: 'Photo & Creative', hasPhoto: true, desc: 'Purple banner box, circular headshot, skills & interests badges (2.foundation)' },
  { id: 'split-navy', name: 'Navy Split Sidebar', color: '#1e3a8a', category: 'Split Layout', hasPhoto: false, desc: 'Deep solid navy right sidebar with white text & left timeline (Mark Griffin)' },
  { id: 'austin-yellow', name: 'Austin Highlighter', color: '#facc15', category: 'Photo & Creative', hasPhoto: true, desc: 'Pitch-black sidebar with photo & vibrant yellow highlighter name (Austin Bronson)' },
  { id: 'minimalist-bennett', name: 'Bennett Minimalist', color: '#27272a', category: 'ATS Standard', hasPhoto: false, desc: 'Ultra-clean monochrome ATS with horizontal dividers & bottom bar (Sebastian Bennett)' },
  { id: 'botanical-bale', name: 'Botanical Green', color: '#164e63', category: 'Photo & Creative', hasPhoto: true, desc: 'Dark botanical green left border accent with top-right headshot (Catherine Bale)' },
  { id: 'mint-franklin', name: 'Franklin Mint', color: '#059669', category: 'ATS Standard', hasPhoto: false, desc: 'Single-column ATS with pastel mint green banner strips (Philip Franklin)' },
  { id: 'creative-watson', name: 'Watson Creative', color: '#ea580c', category: 'Photo & Creative', hasPhoto: true, desc: 'Orange & teal geometric outer border frame with photo & icon badges (Sarah Watson)' },
  { id: 'editorial-smith', name: 'Jane Editorial', color: '#09090b', category: 'Modern Minimalist', hasPhoto: false, desc: 'Warm cream background, bold "Hello! I am..." header & thick rules (Jane Smith)' },
  { id: 'coral-koe', name: 'Nick Coral', color: '#f87171', category: 'Photo & Creative', hasPhoto: true, desc: 'Coral framed circular headshot, coral job accents & soft blue pills (Nick Koe)' },
  { id: 'executive-parvati', name: 'Parvati Bordered', color: '#18181b', category: 'ATS Standard', hasPhoto: false, desc: 'Full-page thin border box, centered uppercase & inline 2-col dates (Anaisha Parvati)' },
  { id: 'sky-warner', name: 'Emaa Sky Blue', color: '#0284c7', category: 'Photo & Creative', hasPhoto: true, desc: 'Pastel sky-blue geometric header block with circular photo & dark footer (Emaa Warner)' },
  { id: 'teal-timeline', name: 'Natalie Timeline', color: '#0d9488', category: 'Photo & Creative', hasPhoto: true, desc: 'Dark teal sidebar, white photo frame, teal badge pills & timeline dots (Natalie Edwards)' },
  { id: 'nordic-earnshaw', name: 'Nordic Taupe', color: '#78716c', category: 'Photo & Creative', hasPhoto: true, desc: 'Warm beige/taupe sidebar with rectangular photo & editorial typography (Catherine Earnshaw)' },
  { id: 'sage-ramanathan', name: 'Priya Sage', color: '#4a7048', category: 'Photo & Creative', hasPhoto: true, desc: 'Sage green circular icon badges & solid sage rounded banner headers (Priya Ramanathan)' },
  { id: 'slate-alvarado', name: 'Lorna Slate', color: '#2563eb', category: 'Photo & Creative', hasPhoto: true, desc: 'Diagonal slate-blue header with circular photo & timeline node dots (Lorna Alvarado)' },
  { id: 'seafoam-smith', name: 'Nelly Seafoam', color: '#0f5132', category: 'Modern Minimalist', hasPhoto: false, desc: 'Seafoam green name box, 3-column contact/summary/skills & banner strips (Nelly Smith)' },

  // Classic ATS Formats
  { id: 'modern-02', name: 'Modern Navy', color: '#1f4e79', category: 'ATS Standard', hasPhoto: false, desc: 'Sans-serif with deep blue accent lines, high ATS score' },
  { id: 'classic-01', name: 'Classic Serif', color: '#111827', category: 'ATS Standard', hasPhoto: false, desc: 'Traditional centered serif, monochrome ATS standard' },
  { id: 'emerald-03', name: 'Executive Emerald', color: '#047857', category: 'ATS Standard', hasPhoto: false, desc: 'Crisp structure with forest emerald accents' },
  { id: 'slate-04', name: 'Minimalist Slate', color: '#334155', category: 'ATS Standard', hasPhoto: false, desc: 'Airy minimalist typography in charcoal slate' },
  { id: 'violet-05', name: 'Tech Violet', color: '#6d28d9', category: 'ATS Standard', hasPhoto: false, desc: 'Startup tech aesthetic with electric purple' },
  { id: 'crimson-06', name: 'Ruby Crimson', color: '#9f1239', category: 'ATS Standard', hasPhoto: false, desc: 'Distinguished burgundy accents for impact' },
]

export function CreateResumePage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 State
  const [rawText, setRawText] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [includePhoto, setIncludePhoto] = useState(false)
  const [photoBase64, setPhotoBase64] = useState('')
  const [headline, setHeadline] = useState('')

  // Step 2 State
  const [questions, setQuestions] = useState<{ question: string; answer: string }[]>([])
  const [draft, setDraft] = useState<ResumeDraft | null>(null)

  // Step 3 State (Editor & Preview)
  const [activeTab, setActiveTab] = useState('template')
  const [templateFilter, setTemplateFilter] = useState<'All' | 'ATS Standard' | 'Photo & Creative' | 'Split Layout' | 'Modern Minimalist'>('All')
  const [previewHtmlString, setPreviewHtmlString] = useState('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  // --- Step 3 Advanced Features State ---
  // Feature 3: Section Reordering
  const [sections, setSections] = useState<string[]>([
    'Template & Style',
    'Personal Info',
    'Experience',
    'Education',
    'Skills',
  ])

  // Feature 2: Bullet Point AI Enhancer
  const [enhancingBulletKey, setEnhancingBulletKey] = useState<string | null>(null)
  const [bulletEnhancement, setBulletEnhancement] = useState<{
    key: string
    data: EnhanceBulletResponse
    selectedText: string
  } | null>(null)

  // Feature 1: Job Description (JD) ATS Matcher & Auto-Tailor
  const [isJdModalOpen, setIsJdModalOpen] = useState(false)
  const [jdText, setJdText] = useState('')
  const [isJdAnalyzing, setIsJdAnalyzing] = useState(false)
  const [jdError, setJdError] = useState<string | null>(null)
  const [atsReport, setAtsReport] = useState<AtsReport | null>(null)
  const [tailorResult, setTailorResult] = useState<TailorResumeResponse | null>(null)

  // Skills input state
  const [newSkillInput, setNewSkillInput] = useState('')

  // Section Reordering Helper
  const moveSection = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= sections.length) return
    const next = [...sections]
    const temp = next[idx]
    next[idx] = next[targetIdx]
    next[targetIdx] = temp
    setSections(next)
  }

  // Bullet Enhancement Handlers
  const handleEnhanceBullet = async (expIdx: number, bIdx: number, bulletText: string, roleTitle?: string) => {
    if (!bulletText.trim()) return
    const key = `${expIdx}-${bIdx}`
    setEnhancingBulletKey(key)
    try {
      const res = await enhanceBullet({
        bullet: bulletText,
        role: roleTitle || draft?.personalInfo?.headline || 'Professional',
        techStack: draft?.skills?.join(', ') || '',
      })
      setBulletEnhancement({
        key,
        data: res,
        selectedText: res.enhancedBullet,
      })
    } catch (err) {
      console.error('Enhance bullet error', err)
      alert('Could not enhance bullet: ' + (err instanceof Error ? err.message : 'AI error'))
    } finally {
      setEnhancingBulletKey(null)
    }
  }

  const applyEnhancedBullet = (expIdx: number, bIdx: number, text: string) => {
    if (!draft) return
    const newExp = [...(draft.experience || [])]
    const newBullets = [...(newExp[expIdx].bullets || [])]
    newBullets[bIdx] = text
    newExp[expIdx] = { ...newExp[expIdx], bullets: newBullets }
    handleDraftChange({ ...draft, experience: newExp })
    setBulletEnhancement(null)
  }

  const handleAddBullet = (expIdx: number) => {
    if (!draft) return
    const newExp = [...(draft.experience || [])]
    const newBullets = [...(newExp[expIdx].bullets || []), '']
    newExp[expIdx] = { ...newExp[expIdx], bullets: newBullets }
    handleDraftChange({ ...draft, experience: newExp })
  }

  const handleRemoveBullet = (expIdx: number, bIdx: number) => {
    if (!draft) return
    const newExp = [...(draft.experience || [])]
    const newBullets = [...(newExp[expIdx].bullets || [])]
    newBullets.splice(bIdx, 1)
    newExp[expIdx] = { ...newExp[expIdx], bullets: newBullets }
    handleDraftChange({ ...draft, experience: newExp })
    if (bulletEnhancement?.key === `${expIdx}-${bIdx}`) {
      setBulletEnhancement(null)
    }
  }

  // Skills Handlers
  const handleAddSkill = () => {
    if (!draft || !newSkillInput.trim()) return
    const val = newSkillInput.trim()
    if (draft.skills?.some((s) => s.toLowerCase() === val.toLowerCase())) {
      setNewSkillInput('')
      return
    }
    handleDraftChange({
      ...draft,
      skills: [...(draft.skills || []), val],
    })
    setNewSkillInput('')
  }

  const handleRemoveSkill = (idx: number) => {
    if (!draft) return
    const next = [...(draft.skills || [])]
    next.splice(idx, 1)
    handleDraftChange({ ...draft, skills: next })
  }

  // Job Description Matching Handlers
  const handleAnalyzeJd = async () => {
    if (!draft || !jdText.trim()) return
    setIsJdAnalyzing(true)
    setJdError(null)
    try {
      const [atsRes, tailorRes] = await Promise.all([
        checkDraftAts(draft, jdText),
        tailorDraft(draft, jdText),
      ])
      setAtsReport(atsRes)
      setTailorResult(tailorRes)
    } catch (err) {
      console.error('JD analysis error', err)
      setJdError(err instanceof Error ? err.message : 'Failed to analyze Job Description')
    } finally {
      setIsJdAnalyzing(false)
    }
  }

  const handleAddMissingSkill = (skill: string) => {
    if (!draft) return
    const currentSkills = draft.skills || []
    if (currentSkills.some((s) => s.toLowerCase() === skill.toLowerCase())) return
    handleDraftChange({
      ...draft,
      skills: [...currentSkills, skill],
    })
  }

  const handleApplyTailoredSummary = (newSummary: string) => {
    if (!draft) return
    handleDraftChange({
      ...draft,
      summary: newSummary,
    })
  }

  const handleApplySuggestedBullet = (orig: string, replacement: string) => {
    if (!draft) return
    let replaced = false
    const newExp = (draft.experience || []).map((exp) => {
      const newBullets = (exp.bullets || []).map((b) => {
        if (!replaced && (b.trim() === orig.trim() || b.includes(orig) || orig.includes(b))) {
          replaced = true
          return replacement
        }
        return b
      })
      return { ...exp, bullets: newBullets }
    })
    handleDraftChange({
      ...draft,
      experience: newExp,
    })
  }

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
      const resolvedHeadline = headline.trim() || targetRole.trim() || generatedDraft.personalInfo?.headline || ''
      const updatedDraft: ResumeDraft = {
        ...generatedDraft,
        personalInfo: {
          ...generatedDraft.personalInfo,
          photoUrl: includePhoto ? photoBase64 : '',
          headline: resolvedHeadline,
        },
        templateId: includePhoto ? 'photo-sidebar-01' : (generatedDraft.templateId || 'modern-02'),
      }

      setDraft(updatedDraft)

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
      const finalDraft: ResumeDraft = {
        ...refinedDraft,
        personalInfo: {
          ...refinedDraft.personalInfo,
          photoUrl: draft.personalInfo?.photoUrl || (includePhoto ? photoBase64 : ''),
          headline: draft.personalInfo?.headline || headline.trim() || targetRole.trim() || '',
        },
        templateId: draft.templateId || 'modern-02',
      }

      setDraft(finalDraft)
      setCurrentStep(3)
      void updatePreview(finalDraft)
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

        <div className="space-y-5">
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

          {/* Photo & Layout Preference */}
          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <label className="block text-sm font-medium text-zinc-200 mb-1">
              Resume Layout &amp; Photo Style
            </label>
            <p className="text-xs text-zinc-400 mb-3">
              Most US/tech ATS systems prefer no photo, while creative &amp; international roles stand out with a professional headshot.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setIncludePhoto(false)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  !includePhoto
                    ? 'bg-[#84cc16]/10 border-[#84cc16] text-white ring-1 ring-[#84cc16]'
                    : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-lg shrink-0">
                  📄
                </div>
                <div>
                  <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                    No Photo
                    <span className="text-[10px] bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded font-normal">
                      ATS Standard
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Classic single column, maximum ATS parser compatibility
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIncludePhoto(true)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  includePhoto
                    ? 'bg-[#84cc16]/10 border-[#84cc16] text-white ring-1 ring-[#84cc16]'
                    : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-lg shrink-0">
                  📷
                </div>
                <div>
                  <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                    Include Headshot Photo
                    <span className="text-[10px] bg-[#84cc16]/20 text-[#84cc16] px-1.5 py-0.5 rounded font-medium">
                      Modern 2-Col
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    2-column sidebar layout with circular avatar &amp; accent bar
                  </p>
                </div>
              </button>
            </div>

            {includePhoto && (
              <div className="pt-3 border-t border-white/5 space-y-3 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {photoBase64 ? (
                    <div className="relative group w-16 h-16 shrink-0">
                      <img
                        src={photoBase64}
                        alt="Headshot Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#84cc16] shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoBase64('')}
                        title="Remove photo"
                        className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 shrink-0 bg-black/30">
                      <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-[8px] uppercase font-mono">Photo</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Upload Headshot Photo (JPG / PNG)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setError('Image file must be under 5MB.')
                            return
                          }
                          const reader = new FileReader()
                          reader.onload = () => {
                            setPhotoBase64(reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#84cc16]/10 file:text-[#84cc16] hover:file:bg-[#84cc16]/20 file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Professional headshot portrait recommended.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Professional Headline / Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer | React & Cloud Architect"
                    className="w-full bg-black/40 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-[#84cc16]"
                  />
                </div>
              </div>
            )}
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
      <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex gap-6 min-h-0 h-[calc(100vh-105px)] max-h-[calc(100vh-105px)]">
        {/* Left Side: Editor */}
        <div className="w-1/2 flex flex-col gap-3 overflow-y-auto pr-2 pb-32 min-h-0 custom-scrollbar">
          <div className="flex items-center justify-between mb-1 shrink-0">
            <h2 className="text-2xl font-medium text-white">Editor</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsJdModalOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-sm hover:border-purple-400"
              >
                <span>🎯 Match Job (ATS)</span>
                {atsReport && (
                  <span className="px-1.5 py-0.2 rounded bg-[#84cc16] text-black text-[10px] font-bold">
                    {atsReport.score}%
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="bg-[#84cc16] hover:bg-[#65a30d] text-black text-sm font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Resume'}
              </button>
            </div>
          </div>

          {/* Accordions */}
          {sections.map((section, sIdx) => {
            const tabKey = section.toLowerCase().split(' ')[0]
            const isActive = activeTab === tabKey
            return (
              <div
                key={section}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all shrink-0"
              >
                <div className="w-full flex items-center justify-between px-4 py-3 min-h-[50px] bg-transparent hover:bg-white/5 transition-colors">
                  <button
                    type="button"
                    onClick={() => setActiveTab(isActive ? '' : tabKey)}
                    className="flex-1 flex items-center gap-2 text-left cursor-pointer"
                  >
                    <span className="font-medium text-sm text-white select-none">{section}</span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Reorder Up */}
                    <button
                      type="button"
                      title="Move section up"
                      disabled={sIdx === 0}
                      onClick={(e) => {
                        e.stopPropagation()
                        moveSection(sIdx, 'up')
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>

                    {/* Reorder Down */}
                    <button
                      type="button"
                      title="Move section down"
                      disabled={sIdx === sections.length - 1}
                      onClick={(e) => {
                        e.stopPropagation()
                        moveSection(sIdx, 'down')
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Toggle Chevron */}
                    <button
                      type="button"
                      onClick={() => setActiveTab(isActive ? '' : tabKey)}
                      className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer ml-1"
                    >
                      <svg
                        className={`w-4 h-4 text-zinc-400 transition-transform ${isActive ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {isActive && (
                  <div className="p-4 border-t border-white/5 bg-black/20">
                    {section === 'Template & Style' && (
                      <div className="space-y-3">
                        <p className="text-xs text-zinc-400">
                          Select a design &amp; color theme. Live preview reflects your choice immediately.
                        </p>

                        {/* Category filter tabs */}
                        <div className="flex flex-wrap gap-1.5 pb-1">
                          {(['All', 'ATS Standard', 'Photo & Creative', 'Split Layout', 'Modern Minimalist'] as const).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setTemplateFilter(cat)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                templateFilter === cat
                                  ? 'bg-[#84cc16] text-black font-semibold'
                                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Photo tip banner if template has photo but no photo uploaded */}
                        {TEMPLATE_OPTIONS.find((t) => t.id === draft.templateId)?.hasPhoto &&
                          !draft.personalInfo?.photoUrl && (
                            <div className="p-2.5 bg-amber-950/40 border border-amber-600/40 rounded-lg text-amber-200 text-xs flex items-center justify-between">
                              <span>📸 This template includes a photo space. Add your photo in Personal Info!</span>
                            </div>
                          )}

                        <div className="grid grid-cols-2 gap-2.5 max-h-[290px] overflow-y-auto pr-1.5 pb-2 custom-scrollbar">
                          {TEMPLATE_OPTIONS.filter(
                            (t) => templateFilter === 'All' || t.category === templateFilter,
                          ).map((t) => {
                            const isSelected =
                              draft.templateId === t.id ||
                              (t.id === 'modern-02' && (!draft.templateId || draft.templateId === 'modern'))
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => handleDraftChange({ ...draft, templateId: t.id })}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[96px] overflow-hidden ${
                                  isSelected
                                    ? 'bg-white/10 border-[#84cc16] shadow-[0_0_15px_rgba(132,204,22,0.15)] ring-1 ring-[#84cc16]'
                                    : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                                }`}
                              >
                                <div className="w-full">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span
                                        className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                                        style={{ backgroundColor: t.color }}
                                      />
                                      <span className="font-semibold text-xs text-white leading-tight truncate">
                                        {t.name}
                                      </span>
                                    </div>
                                    {isSelected && (
                                      <span className="text-[#84cc16] font-bold text-xs shrink-0 ml-1">✓</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    {t.hasPhoto && (
                                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 rounded font-mono shrink-0">
                                        📸 Photo
                                      </span>
                                    )}
                                    <span className="text-[10px] bg-white/5 text-zinc-400 px-1 rounded truncate">
                                      {t.category}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2 w-full">{t.desc}</p>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {section === 'Personal Info' && (
                      <div className="space-y-3.5">
                        {/* Profile Photo Manager */}
                        <div className="p-3 bg-white/[0.03] rounded-lg border border-white/10 flex items-center gap-3">
                          {pInfo.photoUrl ? (
                            <div className="relative w-14 h-14 shrink-0">
                              <img
                                src={pInfo.photoUrl}
                                alt="Headshot"
                                className="w-14 h-14 rounded-full object-cover border-2 border-[#84cc16]"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-black/40 border border-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 space-y-1">
                            <span className="block text-xs font-semibold text-white">Profile Photo</span>
                            <div className="flex items-center gap-2">
                              <label className="text-xs bg-white/10 hover:bg-white/20 text-zinc-200 px-2.5 py-1 rounded cursor-pointer transition-colors inline-block">
                                {pInfo.photoUrl ? 'Change Photo' : 'Upload Photo'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      const reader = new FileReader()
                                      reader.onload = () => {
                                        handleDraftChange({
                                          ...draft,
                                          personalInfo: { ...pInfo, photoUrl: reader.result as string },
                                        })
                                      }
                                      reader.readAsDataURL(file)
                                    }
                                  }}
                                />
                              </label>
                              {pInfo.photoUrl && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDraftChange({
                                      ...draft,
                                      personalInfo: { ...pInfo, photoUrl: '' },
                                    })
                                  }
                                  className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                            Headline / Professional Title
                          </label>
                          <input
                            type="text"
                            value={pInfo.headline || ''}
                            onChange={(e) =>
                              handleDraftChange({
                                ...draft,
                                personalInfo: { ...pInfo, headline: e.target.value },
                              })
                            }
                            className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:border-[#84cc16] outline-none"
                            placeholder="e.g. Senior Full-Stack Engineer"
                          />
                        </div>

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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                              LinkedIn
                            </label>
                            <input
                              type="text"
                              value={pInfo.linkedin || ''}
                              onChange={(e) =>
                                handleDraftChange({
                                  ...draft,
                                  personalInfo: { ...pInfo, linkedin: e.target.value },
                                })
                              }
                              className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-xs text-white focus:border-[#84cc16] outline-none"
                              placeholder="linkedin.com/in/username"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                              GitHub
                            </label>
                            <input
                              type="text"
                              value={pInfo.github || ''}
                              onChange={(e) =>
                                handleDraftChange({
                                  ...draft,
                                  personalInfo: { ...pInfo, github: e.target.value },
                                })
                              }
                              className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-xs text-white focus:border-[#84cc16] outline-none"
                              placeholder="github.com/username"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                              Portfolio
                            </label>
                            <input
                              type="text"
                              value={pInfo.portfolio || ''}
                              onChange={(e) =>
                                handleDraftChange({
                                  ...draft,
                                  personalInfo: { ...pInfo, portfolio: e.target.value },
                                })
                              }
                              className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-xs text-white focus:border-[#84cc16] outline-none"
                              placeholder="yoursite.com"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {section === 'Experience' && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                              Professional Summary
                            </label>
                            <span className="text-[10px] text-zinc-500">AI-optimized</span>
                          </div>
                          <textarea
                            value={draft.summary || ''}
                            onChange={(e) =>
                              handleDraftChange({
                                ...draft,
                                summary: e.target.value,
                              })
                            }
                            rows={3}
                            className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-xs text-white focus:border-[#84cc16] outline-none resize-none leading-relaxed"
                            placeholder="Professional Summary..."
                          />
                        </div>

                        {(draft.experience || []).map((exp, expIdx) => (
                          <div key={expIdx} className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={exp.role || ''}
                                onChange={(e) => {
                                  const newExp = [...(draft.experience || [])]
                                  newExp[expIdx] = { ...newExp[expIdx], role: e.target.value }
                                  handleDraftChange({ ...draft, experience: newExp })
                                }}
                                className="w-full bg-black/40 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#84cc16] outline-none"
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
                                className="w-full bg-black/40 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#84cc16] outline-none"
                                placeholder="Company Name"
                              />
                            </div>

                            <div className="space-y-2 pt-1">
                              <span className="text-[11px] font-semibold text-zinc-400 block">Accomplishment Bullets</span>
                              {(exp.bullets || []).map((bullet: string, bIdx: number) => {
                                const bulletKey = `${expIdx}-${bIdx}`
                                const isEnhancing = enhancingBulletKey === bulletKey
                                const hasEnhancement = bulletEnhancement?.key === bulletKey

                                return (
                                  <div key={bIdx} className="space-y-1.5">
                                    <div className="flex items-start gap-1.5">
                                      <textarea
                                        value={bullet}
                                        onChange={(e) => {
                                          const newBullets = [...(exp.bullets || [])]
                                          newBullets[bIdx] = e.target.value
                                          const newExp = [...(draft.experience || [])]
                                          newExp[expIdx] = { ...newExp[expIdx], bullets: newBullets }
                                          handleDraftChange({ ...draft, experience: newExp })
                                        }}
                                        rows={2}
                                        className="flex-1 bg-black/40 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#84cc16] outline-none resize-none leading-relaxed"
                                        placeholder="Accomplished [X] as measured by [Y] by doing [Z]..."
                                      />
                                      <div className="flex flex-col gap-1 shrink-0">
                                        <button
                                          type="button"
                                          title="Enhance with Google XYZ formula & STAR method"
                                          disabled={!bullet.trim() || isEnhancing}
                                          onClick={() => handleEnhanceBullet(expIdx, bIdx, bullet, exp.role)}
                                          className="px-2 py-1 bg-gradient-to-r from-purple-600/30 to-lime-600/30 hover:from-purple-600/50 hover:to-lime-600/50 border border-purple-500/40 text-[#84cc16] hover:text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                                        >
                                          {isEnhancing ? (
                                            <div className="w-3 h-3 border border-[#84cc16] border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            '✨ AI'
                                          )}
                                        </button>
                                        <button
                                          type="button"
                                          title="Delete bullet point"
                                          onClick={() => handleRemoveBullet(expIdx, bIdx)}
                                          className="px-2 py-0.5 text-zinc-500 hover:text-red-400 text-xs rounded hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    </div>

                                    {/* Active AI Bullet Enhancement Suggestion Box */}
                                    {hasEnhancement && (
                                      <div className="p-3 bg-gradient-to-br from-purple-950/40 to-black/90 border border-purple-500/40 rounded-xl text-xs space-y-2 animate-in fade-in duration-200 shadow-xl">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-purple-300">STAR / XYZ Method:</span>
                                            {bulletEnhancement.data.actionVerbUsed && (
                                              <span className="px-1.5 py-0.2 rounded bg-lime-500/20 text-[#84cc16] font-mono text-[10px] font-bold">
                                                {bulletEnhancement.data.actionVerbUsed}
                                              </span>
                                            )}
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setBulletEnhancement(null)}
                                            className="text-zinc-400 hover:text-white cursor-pointer text-xs"
                                          >
                                            ✕
                                          </button>
                                        </div>

                                        {/* Suggested Primary Bullet */}
                                        <div
                                          onClick={() =>
                                            setBulletEnhancement({
                                              ...bulletEnhancement,
                                              selectedText: bulletEnhancement.data.enhancedBullet,
                                            })
                                          }
                                          className={`p-2 rounded-lg border cursor-pointer transition-all ${
                                            bulletEnhancement.selectedText === bulletEnhancement.data.enhancedBullet
                                              ? 'bg-lime-500/15 border-[#84cc16] text-white shadow-[0_0_10px_rgba(132,204,22,0.15)]'
                                              : 'bg-white/5 border-white/5 text-zinc-300 hover:border-white/20'
                                          }`}
                                        >
                                          <p className="font-medium text-xs leading-relaxed">
                                            {bulletEnhancement.data.enhancedBullet}
                                          </p>
                                          <span className="text-[10px] text-lime-400 mt-1 block">
                                            ✓ Primary recommendation (metric-driven)
                                          </span>
                                        </div>

                                        {/* Alternative Options */}
                                        {bulletEnhancement.data.alternativeOptions?.map((alt, aIdx) => (
                                          <div
                                            key={aIdx}
                                            onClick={() =>
                                              setBulletEnhancement({
                                                ...bulletEnhancement,
                                                selectedText: alt,
                                              })
                                            }
                                            className={`p-2 rounded-lg border cursor-pointer transition-all ${
                                              bulletEnhancement.selectedText === alt
                                                ? 'bg-lime-500/15 border-[#84cc16] text-white shadow-[0_0_10px_rgba(132,204,22,0.15)]'
                                                : 'bg-white/5 border-white/5 text-zinc-300 hover:border-white/20'
                                            }`}
                                          >
                                            <p className="text-xs leading-relaxed">{alt}</p>
                                            <span className="text-[10px] text-zinc-400 mt-0.5 block">
                                              Variation {aIdx + 1}
                                            </span>
                                          </div>
                                        ))}

                                        {bulletEnhancement.data.explanation && (
                                          <p className="text-[11px] text-zinc-400 italic">
                                            💡 {bulletEnhancement.data.explanation}
                                          </p>
                                        )}

                                        <div className="flex items-center justify-end gap-2 pt-1">
                                          <button
                                            type="button"
                                            onClick={() => setBulletEnhancement(null)}
                                            className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              applyEnhancedBullet(expIdx, bIdx, bulletEnhancement.selectedText)
                                            }
                                            className="px-3 py-1 bg-[#84cc16] hover:bg-[#65a30d] text-black font-semibold rounded text-xs transition-colors cursor-pointer shadow"
                                          >
                                            Apply to Resume ✓
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}

                              <button
                                type="button"
                                onClick={() => handleAddBullet(expIdx)}
                                className="text-xs text-[#84cc16] hover:underline flex items-center gap-1 cursor-pointer font-medium pt-1"
                              >
                                + Add Bullet Point
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section === 'Skills' && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          {(draft.skills || []).map((skill: string, sIdx: number) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-1 bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/20 rounded text-xs font-mono flex items-center gap-1.5"
                            >
                              <span>{skill}</span>
                              <button
                                type="button"
                                title="Remove skill"
                                onClick={() => handleRemoveSkill(sIdx)}
                                className="text-zinc-500 hover:text-red-400 cursor-pointer text-xs"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={newSkillInput}
                            onChange={(e) => setNewSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddSkill()
                              }
                            }}
                            placeholder="Add a new skill (e.g. Docker, GraphQL, Kubernetes)..."
                            className="flex-1 bg-black/40 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#84cc16] outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
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
      <div className={`max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 ${currentStep === 3 ? 'py-0' : 'pt-6 pb-8'}`}>
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

      {/* --- Job Description (JD) ATS Matcher & Auto-Tailor Modal --- */}
      {isJdModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-white/15 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🎯</span>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Job Description ATS Matcher &amp; Tailor</h3>
                  <p className="text-xs text-zinc-400">Scan keyword match %, detect missing skills, and auto-tailor bullets with AI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsJdModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {/* Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Target Job Description (JD)</label>
                  <button
                    type="button"
                    onClick={() =>
                      setJdText(
                        `Senior Fullstack Engineer / Tech Lead\nRequirements:\n- 4+ years experience with React, TypeScript, Next.js\n- Robust backend proficiency in Java / Spring Boot or Node.js microservices\n- Containerization and orchestration using Docker, Kubernetes, and CI/CD pipelines\n- Cloud experience with AWS or GCP\n- Proven track record optimizing database queries (MongoDB / PostgreSQL) and system architecture.`,
                      )
                    }
                    className="text-[11px] text-[#84cc16] hover:underline cursor-pointer"
                  >
                    Fill Sample Tech Job Posting
                  </button>
                </div>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={5}
                  placeholder="Paste target job posting from LinkedIn, Indeed, Naukri, or company careers page..."
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-[#84cc16] outline-none leading-relaxed resize-none custom-scrollbar"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-zinc-500">
                    {jdText.trim() ? `${jdText.trim().split(/\s+/).length} words` : 'Paste at least 20 words for best accuracy'}
                  </span>
                  <button
                    type="button"
                    disabled={!jdText.trim() || isJdAnalyzing}
                    onClick={handleAnalyzeJd}
                    className="bg-gradient-to-r from-purple-600 to-lime-600 hover:from-purple-500 hover:to-lime-500 text-white font-semibold text-xs px-5 py-2 rounded-lg transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shadow-lg"
                  >
                    {isJdAnalyzing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Scanning ATS &amp; Tailoring...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡ Scan Match &amp; Tailor</span>
                      </>
                    )}
                  </button>
                </div>
                {jdError && <p className="text-xs text-red-400 mt-2">{jdError}</p>}
              </div>

              {/* Results */}
              {atsReport && (
                <div className="space-y-5 pt-3 border-t border-white/10">
                  {/* Score Banner */}
                  <div className="p-4 bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 block mb-0.5">ATS Match Score</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-[#84cc16]">{atsReport.score}%</span>
                        <span className="text-sm font-semibold text-zinc-300">Grade: {atsReport.grade}</span>
                      </div>
                    </div>
                    <div className="w-48 bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#84cc16] h-full transition-all duration-700"
                        style={{ width: `${atsReport.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Missing vs Matched Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Matched Skills */}
                    <div className="p-3.5 bg-black/40 border border-green-500/20 rounded-xl space-y-2">
                      <span className="text-xs font-semibold text-green-400 flex items-center gap-1">
                        <span>✓</span> Matched Skills ({tailorResult?.matchedSkills?.length ?? atsReport.keywords?.matched?.length ?? 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(tailorResult?.matchedSkills ?? atsReport.keywords?.matched ?? []).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded bg-green-500/10 text-green-300 border border-green-500/20 text-[11px] font-mono"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="p-3.5 bg-black/40 border border-amber-500/20 rounded-xl space-y-2">
                      <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                        <span>⚠️</span> Missing High-Value Skills ({tailorResult?.missingSkills?.length ?? atsReport.keywords?.missing ?? 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(tailorResult?.missingSkills ?? atsReport.keywords?.missing ?? []).map((skill, sIdx) => {
                          const isAlreadyAdded = draft?.skills?.some((s) => s.toLowerCase() === skill.toLowerCase())
                          return (
                            <button
                              key={sIdx}
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={() => handleAddMissingSkill(skill)}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all flex items-center gap-1 cursor-pointer ${
                                isAlreadyAdded
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                  : 'bg-amber-500/15 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30'
                              }`}
                            >
                              <span>{isAlreadyAdded ? '✓' : '+'}</span>
                              <span>{skill}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Tailored Professional Summary */}
                  {tailorResult?.tailoredSummary && (
                    <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-purple-300">✨ AI Tailored Professional Summary</span>
                        <button
                          type="button"
                          onClick={() => handleApplyTailoredSummary(tailorResult.tailoredSummary)}
                          className="px-2.5 py-1 bg-[#84cc16] hover:bg-[#65a30d] text-black font-semibold rounded text-[11px] transition-colors cursor-pointer"
                        >
                          Apply to Resume ✓
                        </button>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed italic bg-black/30 p-2.5 rounded-lg border border-white/5">
                        "{tailorResult.tailoredSummary}"
                      </p>
                    </div>
                  )}

                  {/* Suggested Bullet Improvements */}
                  {tailorResult?.suggestedBulletImprovements && tailorResult.suggestedBulletImprovements.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-semibold text-zinc-300">✨ JD-Targeted Bullet Improvements</span>
                      {tailorResult.suggestedBulletImprovements.map((b, bIdx) => (
                        <div key={bIdx} className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Original Bullet</span>
                            <p className="text-xs text-zinc-400 line-through">{b.originalBullet}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-lime-400 uppercase tracking-wider font-semibold">
                              Optimized for JD
                            </span>
                            <p className="text-xs text-white font-medium">{b.suggestedBullet}</p>
                            {b.reason && <p className="text-[10px] text-zinc-500 italic">Reason: {b.reason}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplySuggestedBullet(b.originalBullet, b.suggestedBullet)}
                            className="px-2.5 py-1 bg-white/10 hover:bg-[#84cc16] hover:text-black text-white text-[11px] font-semibold rounded transition-colors cursor-pointer"
                          >
                            Apply Bullet to Resume ✓
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recruiter Coaching Advice */}
                  {tailorResult?.overallAdvice && (
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-xs font-semibold text-zinc-300 block mb-1">💡 Recruiter Advice</span>
                      <p className="text-xs text-zinc-400 leading-relaxed">{tailorResult.overallAdvice}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-white/10 bg-black/40 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Changes apply directly to your draft in real time</span>
              <button
                type="button"
                onClick={() => setIsJdModalOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

export default CreateResumePage
