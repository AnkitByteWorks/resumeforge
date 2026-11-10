import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { AppLayout } from '../components/AppLayout'
import { useAuth } from '../auth/auth-context'
import {
  generateDraft,
  refineDraft,
  previewHtml,
  saveResume,
  enhanceBullet,
  tailorDraft,
  checkDraftAts,
  parseResumePdf,
  generateCoverLetter,
} from '../api/resumes'
import { cleanDraft } from '../lib/draft'
import type { ResumeDraft, EnhanceBulletResponse, TailorResumeResponse, AtsReport, CoverLetterResponse } from '../types'

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
  badge?: string
  featured?: boolean
  sortOrder: number
}> = [
  // Top Picks
  { id: 'modern-02', name: 'Modern Navy', color: '#1f4e79', category: 'ATS Standard', hasPhoto: false, desc: 'Clean sans-serif with deep blue accent headings, maximum ATS parse score', badge: '🎯 99% ATS', featured: true, sortOrder: 1 },
  { id: 'foundation-purple', name: 'Foundation Purple', color: '#4a2c82', category: 'Photo & Creative', hasPhoto: true, desc: 'Royal purple banner box with circular headshot & left skills sidebar', badge: '⭐ TOP PICK', featured: true, sortOrder: 2 },
  { id: 'split-navy', name: 'Navy Split Sidebar', color: '#1e3a8a', category: 'Split Layout', hasPhoto: false, desc: 'Solid navy right sidebar with white text & left chronological timeline', badge: '🔥 MOST POPULAR', featured: true, sortOrder: 3 },
  { id: 'minimalist-bennett', name: 'Bennett Minimalist', color: '#27272a', category: 'ATS Standard', hasPhoto: false, desc: 'Ultra-clean monochrome ATS with horizontal dividers & bottom bar', badge: '✨ EXECUTIVE', featured: true, sortOrder: 4 },
  { id: 'austin-yellow', name: 'Austin Highlighter', color: '#facc15', category: 'Photo & Creative', hasPhoto: true, desc: 'High contrast black sidebar with photo & vibrant yellow highlighter name', badge: '💼 BEST FOR TECH', featured: true, sortOrder: 5 },
  { id: 'teal-timeline', name: 'Natalie Timeline', color: '#0d9488', category: 'Split Layout', hasPhoto: true, desc: 'Dark teal sidebar, white photo frame, teal badge pills & timeline dots', badge: '⭐ TOP PICK', featured: true, sortOrder: 6 },
  { id: 'editorial-smith', name: 'Jane Editorial', color: '#09090b', category: 'Modern Minimalist', hasPhoto: false, desc: 'Warm cream background, bold "Hello! I am..." header & thick rules', badge: '✨ STYLISTIC', featured: true, sortOrder: 7 },
  { id: 'creative-watson', name: 'Watson Creative', color: '#ea580c', category: 'Photo & Creative', hasPhoto: true, desc: 'Orange & teal geometric outer border frame with photo & icon badges', badge: '🎨 DESIGNER PICK', featured: true, sortOrder: 8 },
  { id: 'slate-alvarado', name: 'Lorna Slate', color: '#2563eb', category: 'Photo & Creative', hasPhoto: true, desc: 'Diagonal slate-blue header with circular photo & timeline node dots', badge: '💎 MODERN ATS', featured: true, sortOrder: 9 },
  { id: 'nordic-earnshaw', name: 'Nordic Taupe', color: '#78716c', category: 'Photo & Creative', hasPhoto: true, desc: 'Warm beige/taupe sidebar with rectangular photo & editorial typography', badge: '🕊️ MINIMALIST', featured: true, sortOrder: 10 },

  // Remaining Screenshot Reference Templates (11 - 17)
  { id: 'botanical-bale', name: 'Botanical Green', color: '#164e63', category: 'Photo & Creative', hasPhoto: true, desc: 'Dark botanical green left border accent with top-right headshot', sortOrder: 11 },
  { id: 'mint-franklin', name: 'Franklin Mint', color: '#059669', category: 'ATS Standard', hasPhoto: false, desc: 'Single-column ATS with pastel mint green banner strips', sortOrder: 12 },
  { id: 'coral-koe', name: 'Nick Coral', color: '#f87171', category: 'Photo & Creative', hasPhoto: true, desc: 'Coral framed circular headshot, coral job accents & soft blue pills', sortOrder: 13 },
  { id: 'executive-parvati', name: 'Parvati Bordered', color: '#18181b', category: 'ATS Standard', hasPhoto: false, desc: 'Full-page thin border box, centered uppercase & inline 2-col dates', sortOrder: 14 },
  { id: 'sky-warner', name: 'Emaa Sky Blue', color: '#0284c7', category: 'Photo & Creative', hasPhoto: true, desc: 'Pastel sky-blue geometric header block with circular photo & dark footer', sortOrder: 15 },
  { id: 'sage-ramanathan', name: 'Priya Sage', color: '#4a7048', category: 'Photo & Creative', hasPhoto: true, desc: 'Sage green circular icon badges & solid sage rounded banner headers', sortOrder: 16 },
  { id: 'seafoam-smith', name: 'Nelly Seafoam', color: '#0f5132', category: 'Modern Minimalist', hasPhoto: false, desc: 'Seafoam green name box, 3-column contact/summary/skills & banner strips', sortOrder: 17 },
]

const COLOR_PRESETS = [
  { name: 'Template Default', hex: '', bg: 'transparent' },
  { name: 'Deep Navy', hex: '#1e3a8a', bg: '#1e3a8a' },
  { name: 'Emerald', hex: '#059669', bg: '#059669' },
  { name: 'Royal Violet', hex: '#6d28d9', bg: '#6d28d9' },
  { name: 'Ruby Red', hex: '#dc2626', bg: '#dc2626' },
  { name: 'Corporate Slate', hex: '#334155', bg: '#334155' },
  { name: 'Amber Gold', hex: '#d97706', bg: '#d97706' },
  { name: 'Ocean Cyan', hex: '#0891b2', bg: '#0891b2' },
  { name: 'Rose Quartz', hex: '#e11d48', bg: '#e11d48' },
]

const FONT_PRESETS = [
  { id: 'sans', name: 'Inter (Modern Sans)', desc: 'Clean, versatile & maximum ATS compatibility' },
  { id: 'serif', name: 'Georgia (Classic Serif)', desc: 'Elegant, distinguished editorial authority' },
  { id: 'modern', name: 'Segoe UI (Corporate Clean)', desc: 'Crisp, contemporary tech aesthetic' },
  { id: 'clean', name: 'Arial (Neutral ATS)', desc: 'Universal standard recognized by all parsers' },
]

export function CreateResumePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Virtual A4 live preview responsive scaling
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0.65)

  useEffect(() => {
    if (!previewContainerRef.current) return
    const updateScale = () => {
      if (!previewContainerRef.current) return
      const width = previewContainerRef.current.clientWidth
      // 794px is standard A4 paper width at 96 DPI. Leave 36px for container margins
      const calculatedScale = Math.min(1, Math.max(0.35, (width - 36) / 794))
      setPreviewScale(calculatedScale)
    }
    updateScale()
    const observer = new ResizeObserver(() => updateScale())
    observer.observe(previewContainerRef.current)
    return () => observer.disconnect()
  }, [])

  // Step 1 State
  const [inputMode, setInputMode] = useState<'pdf' | 'text'>('pdf')
  const [rawText, setRawText] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [includePhoto, setIncludePhoto] = useState(false)
  const [photoBase64, setPhotoBase64] = useState('')
  const [headline, setHeadline] = useState('')

  // Step 1 PDF Upload State
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isPdfDragging, setIsPdfDragging] = useState(false)
  const [isPdfParsing, setIsPdfParsing] = useState(false)
  const [pdfParsingStatus, setPdfParsingStatus] = useState('')
  const pdfInputRef = useRef<HTMLInputElement>(null)

  // Step 2 State
  const [questions, setQuestions] = useState<{ question: string; answer: string }[]>([])
  const [draft, setDraft] = useState<ResumeDraft | null>(null)

  // Step 3 State (Editor & Preview)
  const [activeTab, setActiveTab] = useState('template')
  const [templateFilter, setTemplateFilter] = useState<'Top Picks' | 'All' | 'ATS Standard' | 'Photo & Creative' | 'Split Layout' | 'Modern Minimalist'>('Top Picks')
  const [templateSearch, setTemplateSearch] = useState('')
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

  // Feature: Page Break Guide
  const [showPageBreakGuide, setShowPageBreakGuide] = useState(false)

  // Feature: 1-Click AI Cover Letter
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false)
  const [clCompany, setClCompany] = useState('')
  const [clRole, setClRole] = useState('')
  const [clJd, setClJd] = useState('')
  const [clTone, setClTone] = useState<'professional' | 'enthusiastic' | 'executive'>('professional')
  const [isGeneratingCl, setIsGeneratingCl] = useState(false)
  const [clResult, setClResult] = useState<CoverLetterResponse | null>(null)
  const [clEditedText, setClEditedText] = useState('')
  const [clCopied, setClCopied] = useState(false)

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

  // --- COVER LETTER HANDLERS ---
  const handleOpenCoverLetter = () => {
    if (!clRole && (draft?.personalInfo?.headline || targetRole)) {
      setClRole(draft?.personalInfo?.headline || targetRole || '')
    }
    setIsCoverLetterModalOpen(true)
  }

  const handleGenerateCoverLetter = async () => {
    if (!clCompany.trim() || !clRole.trim()) {
      alert('Please provide both a Company Name and Target Role.')
      return
    }
    setIsGeneratingCl(true)
    try {
      const res = await generateCoverLetter({
        candidateName: draft?.personalInfo?.fullName || user?.name || 'Applicant',
        candidateEmail: draft?.personalInfo?.email || user?.email || '',
        candidatePhone: draft?.personalInfo?.phone || '',
        candidateLocation: draft?.personalInfo?.location || '',
        currentRole: draft?.personalInfo?.headline || targetRole || '',
        companyName: clCompany.trim(),
        jobTitle: clRole.trim(),
        jobDescription: clJd.trim() || undefined,
        resumeSummary: draft?.summary || '',
        skills: draft?.skills || [],
        experienceHighlights: draft?.experience?.flatMap((e) => e.bullets || []).slice(0, 5) || [],
        tone: clTone,
      })
      setClResult(res)
      setClEditedText(res.fullLetter)
    } catch (err) {
      console.error('Failed to generate cover letter', err)
      alert('Cover letter generation failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsGeneratingCl(false)
    }
  }

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(clEditedText)
    setClCopied(true)
    setTimeout(() => setClCopied(false), 2000)
  }

  const handleDownloadCoverLetter = () => {
    const blob = new Blob([clEditedText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Cover_Letter_${clCompany.trim().replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
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
            '<style>:root{color-scheme:light}html,body{background:#fff;margin:0;box-sizing:border-box}</style></head>',
          )
        : html
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
      const resolvedName = generatedDraft.personalInfo?.fullName || user?.name || 'Your Name'
      const updatedDraft: ResumeDraft = {
        ...generatedDraft,
        personalInfo: {
          ...generatedDraft.personalInfo,
          fullName: resolvedName,
          photoUrl: includePhoto ? photoBase64 : '',
          headline: resolvedHeadline,
        },
        templateId: includePhoto ? 'foundation-purple' : (generatedDraft.templateId || 'modern-02'),
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

  const handlePdfUpload = async (fileToParse?: File | null) => {
    const file = fileToParse ?? pdfFile
    if (!file) {
      setError('Please choose a PDF resume file to upload.')
      return
    }
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Please select a valid PDF file (.pdf).')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('PDF file size must be under 15MB.')
      return
    }

    setPdfFile(file)
    setIsPdfParsing(true)
    setError(null)
    setPdfParsingStatus('Extracting text and structure from PDF...')

    const t1 = setTimeout(() => {
      setPdfParsingStatus('AI identifying roles, metrics, skills & achievements...')
    }, 2500)
    const t2 = setTimeout(() => {
      setPdfParsingStatus('Formulating ATS draft and smart interview questions...')
    }, 6000)

    try {
      const response = await parseResumePdf(file, targetRole)
      clearTimeout(t1)
      clearTimeout(t2)

      const generatedDraft = response.draft ?? response.resume
      const resolvedHeadline = headline.trim() || targetRole.trim() || generatedDraft.personalInfo?.headline || ''
      const resolvedName = generatedDraft.personalInfo?.fullName || user?.name || 'Your Name'
      const updatedDraft: ResumeDraft = {
        ...generatedDraft,
        personalInfo: {
          ...generatedDraft.personalInfo,
          fullName: resolvedName,
          photoUrl: includePhoto ? photoBase64 : '',
          headline: resolvedHeadline,
        },
        templateId: includePhoto ? 'foundation-purple' : (generatedDraft.templateId || 'modern-02'),
      }

      if (!targetRole && resolvedHeadline) {
        setTargetRole(resolvedHeadline)
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
          { question: 'What was your biggest accomplishment or quantified result in your most recent role?', answer: '' },
          { question: 'Are there any key tools, certifications, or metrics you want to add?', answer: '' },
        ])
      }

      setCurrentStep(2)
    } catch (err: unknown) {
      clearTimeout(t1)
      clearTimeout(t2)
      console.error('PDF parsing error', err)
      setError(err instanceof Error ? err.message : 'Failed to parse resume PDF. Please try again or paste text.')
    } finally {
      setIsPdfParsing(false)
      setPdfParsingStatus('')
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
          {/* Input Method Toggle */}
          <div className="pt-1">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Choose How to Start
            </label>
            <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/10 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setInputMode('pdf')}
                className={`py-3 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  inputMode === 'pdf'
                    ? 'bg-[#84cc16] text-black shadow-lg shadow-[#84cc16]/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Resume (PDF)</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                  inputMode === 'pdf' ? 'bg-black/20 text-black' : 'bg-[#84cc16]/10 text-[#84cc16]'
                }`}>
                  New ✨
                </span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`py-3 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  inputMode === 'text'
                    ? 'bg-[#84cc16] text-black shadow-lg shadow-[#84cc16]/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Type or Paste Text</span>
              </button>
            </div>
          </div>

          {inputMode === 'pdf' ? (
            /* PDF Upload Dropzone */
            <div className="space-y-4 pt-1">
              <input
                type="file"
                ref={pdfInputRef}
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setPdfFile(file)
                    setError(null)
                  }
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsPdfDragging(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  setIsPdfDragging(false)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsPdfDragging(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) {
                    setPdfFile(file)
                    setError(null)
                  }
                }}
                onClick={() => !isPdfParsing && pdfInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${
                  isPdfDragging
                    ? 'border-[#84cc16] bg-[#84cc16]/10 scale-[1.01]'
                    : pdfFile
                    ? 'border-[#84cc16]/60 bg-black/40 hover:border-[#84cc16]'
                    : 'border-zinc-700 bg-black/30 hover:border-zinc-500 hover:bg-black/40'
                }`}
              >
                {isPdfParsing ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-[#84cc16]/20 border-t-[#84cc16] animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-xl">
                        📄
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white animate-pulse">
                        {pdfParsingStatus || 'AI Parsing your resume...'}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Extracting contact, experience, education &amp; skills
                      </p>
                    </div>
                  </div>
                ) : pdfFile ? (
                  <div className="py-2 flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#84cc16]/10 border border-[#84cc16]/30 flex items-center justify-center text-3xl">
                      📑
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white flex items-center justify-center gap-2">
                        {pdfFile.name}
                        <span className="text-[11px] bg-white/10 text-zinc-300 px-2 py-0.5 rounded-full font-normal">
                          {(pdfFile.size / 1024).toFixed(0)} KB
                        </span>
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Click or drag to replace with another PDF
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPdfFile(null)
                          if (pdfInputRef.current) pdfInputRef.current.value = ''
                        }}
                        className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                      >
                        Remove file
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 group-hover:border-[#84cc16]/40 group-hover:scale-110 flex items-center justify-center text-2xl transition-all">
                      📄
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Click to browse or drop your resume PDF here
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Supports PDF up to 15MB • Preserves your employment history &amp; achievements
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300 font-medium">
                      <span>Instant ATS Conversion</span>
                      <span className="text-[#84cc16]">⚡</span>
                    </div>
                  </div>
                )}
              </div>

              {/* PDF Parsing action button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handlePdfUpload()}
                  disabled={!pdfFile || isPdfParsing}
                  className="bg-[#84cc16] hover:bg-[#65a30d] text-black font-semibold px-8 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-lg shadow-[#84cc16]/10"
                >
                  {isPdfParsing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Parsing with AI...
                    </>
                  ) : (
                    <>
                      Parse Resume with AI
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Text Input Mode */
            <div className="space-y-5">
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
          )}
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
                onClick={handleOpenCoverLetter}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 text-emerald-200 border border-emerald-500/40 text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-sm hover:border-emerald-400"
                title="Generate a tailored Cover Letter for this resume"
              >
                <span>✉️ Cover Letter</span>
              </button>
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
                      <div className="space-y-3.5">
                        <p className="text-xs text-zinc-400">
                          Select a design &amp; color theme. Live preview reflects your choice immediately.
                        </p>

                        {/* Category filter tabs */}
                        <div className="flex flex-wrap gap-1.5 pb-1">
                          {(['Top Picks', 'All', 'ATS Standard', 'Photo & Creative', 'Split Layout', 'Modern Minimalist'] as const).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setTemplateFilter(cat)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                                templateFilter === cat
                                  ? 'bg-[#84cc16] text-black font-semibold shadow-md'
                                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <span>{cat === 'Top Picks' ? '⭐ Top Picks' : cat}</span>
                              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                                templateFilter === cat ? 'bg-black/20 text-black font-bold' : 'bg-white/10 text-zinc-300'
                              }`}>
                                {cat === 'Top Picks'
                                  ? TEMPLATE_OPTIONS.filter((t) => t.featured).length
                                  : cat === 'All'
                                  ? TEMPLATE_OPTIONS.length
                                  : TEMPLATE_OPTIONS.filter((t) => t.category === cat).length}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Fast Search input */}
                        <div className="relative">
                          <input
                            type="text"
                            value={templateSearch}
                            onChange={(e) => setTemplateSearch(e.target.value)}
                            placeholder="Search 17 reference templates (e.g. Modern Navy, Foundation, Austin, Bennett)..."
                            className="w-full bg-black/40 border border-zinc-800 text-white text-xs rounded-lg pl-8 pr-7 py-1.5 outline-none focus:border-[#84cc16] transition-all"
                          />
                          <span className="absolute left-2.5 top-1.5 text-xs text-zinc-500">🔍</span>
                          {templateSearch && (
                            <button
                              type="button"
                              onClick={() => setTemplateSearch('')}
                              className="absolute right-2.5 top-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Photo tip banner if template has photo but no photo uploaded */}
                        {TEMPLATE_OPTIONS.find((t) => t.id === draft.templateId)?.hasPhoto &&
                          !draft.personalInfo?.photoUrl && (
                            <div className="p-2.5 bg-amber-950/40 border border-amber-600/40 rounded-lg text-amber-200 text-xs flex items-center justify-between">
                              <span>📸 This template includes a photo space. Add your photo in Personal Info!</span>
                            </div>
                          )}

                        <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1.5 pb-2 custom-scrollbar">
                          {TEMPLATE_OPTIONS.filter((t) => {
                            const matchesCat =
                              templateFilter === 'All'
                                ? true
                                : templateFilter === 'Top Picks'
                                ? t.featured
                                : t.category === templateFilter
                            const matchesSearch =
                              !templateSearch.trim() ||
                              t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                              t.desc.toLowerCase().includes(templateSearch.toLowerCase()) ||
                              t.category.toLowerCase().includes(templateSearch.toLowerCase()) ||
                              (t.badge && t.badge.toLowerCase().includes(templateSearch.toLowerCase()))
                            return matchesCat && matchesSearch
                          }).map((t) => {
                            const isSelected =
                              draft.templateId === t.id ||
                              (t.id === 'modern-02' && (!draft.templateId || draft.templateId === 'modern'))
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => handleDraftChange({ ...draft, templateId: t.id })}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] overflow-hidden relative ${
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

                                  <div className="flex flex-wrap items-center gap-1 mb-1">
                                    {t.badge && (
                                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                                        {t.badge}
                                      </span>
                                    )}
                                    {t.hasPhoto && (
                                      <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded font-mono shrink-0">
                                        📸 Photo
                                      </span>
                                    )}
                                    <span className="text-[9px] bg-white/5 text-zinc-400 px-1 rounded truncate">
                                      {t.category}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2 w-full mt-1">{t.desc}</p>
                              </button>
                            )
                          })}
                        </div>

                        {/* --- DESIGN CUSTOMIZATION CONTROLS --- */}
                        <div className="pt-3 border-t border-white/10 space-y-4">
                          {/* Accent Color Palette */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                                <span>🎨 Accent Color</span>
                              </span>
                              <span className="text-[11px] text-zinc-400 font-mono">
                                {draft.accentColor || 'Template Default'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {COLOR_PRESETS.map((c) => {
                                const isCurrent = (!draft.accentColor && !c.hex) || (draft.accentColor?.toLowerCase() === c.hex.toLowerCase())
                                return (
                                  <button
                                    key={c.name}
                                    type="button"
                                    onClick={() => handleDraftChange({ ...draft, accentColor: c.hex || undefined })}
                                    title={c.name + (c.hex ? ` (${c.hex})` : '')}
                                    className={`relative w-7 h-7 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                                      isCurrent
                                        ? 'ring-2 ring-[#84cc16] ring-offset-2 ring-offset-zinc-900 scale-110'
                                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                                    }`}
                                    style={{
                                      backgroundColor: c.bg === 'transparent' ? '#3f3f46' : c.bg,
                                      border: c.bg === 'transparent' ? '1px dashed #71717a' : '1px solid rgba(255,255,255,0.2)',
                                    }}
                                  >
                                    {!c.hex && <span className="text-[9px] text-zinc-300 font-bold">DEF</span>}
                                    {isCurrent && c.hex && (
                                      <span className="text-white text-xs font-black drop-shadow">✓</span>
                                    )}
                                  </button>
                                )
                              })}
                              {/* Custom Color Input */}
                              <label
                                title="Custom Hex Color"
                                className="relative w-7 h-7 rounded-full border border-white/30 cursor-pointer overflow-hidden flex items-center justify-center bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 hover:scale-105 transition-transform"
                              >
                                <input
                                  type="color"
                                  value={draft.accentColor || '#1e3a8a'}
                                  onChange={(e) => handleDraftChange({ ...draft, accentColor: e.target.value })}
                                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                />
                                <span className="text-[10px] text-white font-bold drop-shadow">+</span>
                              </label>
                            </div>
                          </div>

                          {/* Font Family Selector */}
                          <div>
                            <span className="text-xs font-semibold text-white block mb-2">
                              🔤 Typography &amp; Font Family
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {FONT_PRESETS.map((f) => {
                                const isCurrent = (!draft.fontFamily && f.id === 'sans') || draft.fontFamily === f.id
                                return (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => handleDraftChange({ ...draft, fontFamily: f.id })}
                                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                                      isCurrent
                                        ? 'bg-[#84cc16]/10 border-[#84cc16] text-white shadow-sm ring-1 ring-[#84cc16]'
                                        : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                                    }`}
                                  >
                                    <div className="text-xs font-medium text-white flex items-center justify-between">
                                      <span>{f.name}</span>
                                      {isCurrent && <span className="text-[#84cc16] text-[11px] font-bold">✓</span>}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{f.desc}</p>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Page Spacing / Density (1-Page Fit) */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                                <span>📐 Page Density (A4 Fit Control)</span>
                              </span>
                              <span className="text-[10px] text-emerald-400 font-medium">
                                {draft.pageDensity === 'compact' ? '⚡ 20% More Content Fits' : 'Default Margins'}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                              {[
                                { id: 'compact', label: 'Compact', desc: 'Tight margins & lines' },
                                { id: 'auto', label: 'Normal', desc: 'Balanced spacing' },
                                { id: 'spacious', label: 'Spacious', desc: 'Relaxed margins' },
                              ].map((d) => {
                                const isCurrent = (!draft.pageDensity && d.id === 'auto') || draft.pageDensity === d.id
                                return (
                                  <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => handleDraftChange({ ...draft, pageDensity: d.id as any })}
                                    className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
                                      isCurrent
                                        ? 'bg-[#84cc16] text-black font-semibold shadow'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div>{d.label}</div>
                                    <div className={`text-[9px] ${isCurrent ? 'text-black/70 font-normal' : 'text-zinc-500'}`}>{d.desc}</div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
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

        {/* Right Side: Virtual A4 Sheet Live Preview (Responsive Scaling) */}
        <div
          ref={previewContainerRef}
          className="w-1/2 bg-zinc-950/70 border border-white/10 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-2xl"
        >
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between mb-3 px-1 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live A4 Preview
              </span>
              <button
                type="button"
                onClick={() => setShowPageBreakGuide((prev) => !prev)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                  showPageBreakGuide
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 font-medium'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                }`}
                title="Toggle visual page boundary guide"
              >
                <span>✂️ Page Cut Guide</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {draft.pageDensity !== 'compact' && (
                <button
                  type="button"
                  onClick={() => handleDraftChange({ ...draft, pageDensity: 'compact' })}
                  className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-1"
                  title="Tighten spacing to guarantee 1-page fit"
                >
                  <span>⚡ Fit to 1 Page</span>
                </button>
              )}
              <div className="bg-zinc-900/90 backdrop-blur-md text-zinc-300 text-[11px] px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-2">
                {isPreviewLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rendering...</span>
                  </>
                ) : (
                  <span>A4 Sheet ({Math.round(previewScale * 100)}%)</span>
                )}
              </div>
            </div>
          </div>

          {previewHtmlString ? (
            <div className="w-full flex-1 overflow-y-auto flex justify-center py-1">
              <div
                style={{
                  width: `${794 * previewScale}px`,
                  height: `${1123 * previewScale}px`,
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'width 0.15s ease-out, height 0.15s ease-out',
                }}
                className="shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden relative"
              >
                <iframe
                  srcDoc={previewHtmlString}
                  style={{
                    width: '794px',
                    height: '1123px',
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                    border: 'none',
                    background: '#ffffff',
                    display: 'block',
                  }}
                  title="Resume Preview"
                />

                {/* Page Break Guide Marker */}
                {showPageBreakGuide && (
                  <div
                    style={{
                      position: 'absolute',
                      top: `${1123 * previewScale - 4}px`,
                      left: 0,
                      right: 0,
                    }}
                    className="z-30 pointer-events-none flex items-center justify-center"
                  >
                    <div className="w-full border-b-2 border-dashed border-red-500/90 shadow-md" />
                    <span className="absolute bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                      ✂️ A4 Page 1 End (297mm)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : previewError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400">
              <p className="text-sm text-red-400 mb-3">{previewError}</p>
              <button
                type="button"
                onClick={() => draft && void updatePreview(draft)}
                className="px-4 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors cursor-pointer border border-white/10"
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

      {/* --- 1-Click AI Cover Letter Generator Modal --- */}
      {isCoverLetterModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-white/15 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">✉️</span>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">1-Click AI Cover Letter Generator</h3>
                  <p className="text-xs text-zinc-400">Transform your resume experience into an articulate, tailored cover letter</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCoverLetterModalOpen(false)}
                className="text-zinc-400 hover:text-white text-lg p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              {!clResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                        Target Company <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={clCompany}
                        onChange={(e) => setClCompany(e.target.value)}
                        placeholder="e.g. Google, Stripe, Microsoft, Razorpay"
                        className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-[#84cc16] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                        Target Role / Job Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={clRole}
                        onChange={(e) => setClRole(e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-[#84cc16] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Target Job Description (Optional, Recommended for ATS alignment)
                    </label>
                    <textarea
                      value={clJd}
                      onChange={(e) => setClJd(e.target.value)}
                      placeholder="Paste key responsibilities or requirements from the job posting..."
                      rows={4}
                      className="w-full bg-black/40 border border-zinc-800 rounded-lg p-3 text-xs text-white focus:border-[#84cc16] outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-2">Writing Tone</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'professional', label: '👔 Confident & Professional', desc: 'Authoritative, clear & metric-driven' },
                        { id: 'enthusiastic', label: '🚀 Enthusiastic & Driven', desc: 'High energy, passion for mission' },
                        { id: 'executive', label: '💎 Executive & Strategic', desc: 'Leadership, scale & ROI focus' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setClTone(t.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            clTone === t.id
                              ? 'bg-[#84cc16]/10 border-[#84cc16] text-white shadow-sm ring-1 ring-[#84cc16]'
                              : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-semibold text-white">{t.label}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleGenerateCoverLetter}
                      disabled={isGeneratingCl || !clCompany.trim() || !clRole.trim()}
                      className="bg-[#84cc16] hover:bg-[#65a30d] text-black font-semibold text-xs px-5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingCl ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Generating Cover Letter...</span>
                        </>
                      ) : (
                        <>
                          <span>✨ Generate Cover Letter</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-base">✅</span>
                      <div>
                        <span className="text-xs font-bold text-emerald-300">
                          Cover Letter Generated for {clCompany}
                        </span>
                        <p className="text-[11px] text-zinc-400">Position: {clRole} • Tone: {clTone}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setClResult(null)}
                      className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Edit Inputs / Regenerate
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">
                        Editable Cover Letter ({clEditedText.split(/\s+/).filter(Boolean).length} words)
                      </span>
                      <span className="text-[10px] text-zinc-500">Click below to make any fine adjustments</span>
                    </div>
                    <textarea
                      value={clEditedText}
                      onChange={(e) => setClEditedText(e.target.value)}
                      rows={14}
                      className="w-full bg-black/60 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-200 font-serif leading-relaxed focus:border-[#84cc16] outline-none resize-none shadow-inner custom-scrollbar"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyCoverLetter}
                        className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {clCopied ? (
                          <>
                            <span className="text-[#84cc16]">✓</span>
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <span>📋</span>
                            <span>Copy Letter</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadCoverLetter}
                        className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>⬇️</span>
                        <span>Download (.txt)</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCoverLetterModalOpen(false)}
                      className="px-4 py-2 bg-[#84cc16] hover:bg-[#65a30d] text-black rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

export default CreateResumePage
