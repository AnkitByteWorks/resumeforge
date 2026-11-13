import { api, apiBlob, apiText, apiUpload } from './client'
import type {
  AiAnswer,
  AiDraftResult,
  AtsReport,
  CoverLetterRequest,
  CoverLetterResponse,
  EnhanceBulletRequest,
  EnhanceBulletResponse,
  PublicResumeDto,
  ResumeDraft,
  ResumeSummary,
  SavedResume,
  ShareResumeResponse,
  TailorResumeResponse,
  TemplateInfo,
} from '../types'

const orNull = (s: string | null | undefined) => (!s || s.trim() === '' ? null : s.trim())

export function fetchTemplates(): Promise<TemplateInfo[]> {
  return api<TemplateInfo[]>('/api/v1/templates', { auth: false })
}

export function fetchResumes(): Promise<ResumeSummary[]> {
  return api<ResumeSummary[]>('/api/v1/resumes')
}

export type GenerateDraftParams = {
  text: string
  targetRole?: string | null
  jobDescription?: string | null
}

export async function generateDraft(
  textOrParams: string | GenerateDraftParams,
  targetRole?: string | null,
  jobDescription?: string | null,
): Promise<AiDraftResult & { draft: ResumeDraft }> {
  const p =
    typeof textOrParams === 'object'
      ? textOrParams
      : { text: textOrParams, targetRole, jobDescription }

  const res = await api<AiDraftResult>('/api/v1/ai/draft', {
    method: 'POST',
    body: {
      text: p.text.trim(),
      targetRole: orNull(p.targetRole),
      jobDescription: orNull(p.jobDescription),
    },
  })

  return {
    ...res,
    draft: res.resume,
  }
}

export async function parseResumePdf(
  file: File,
  targetRole?: string | null
): Promise<AiDraftResult & { draft: ResumeDraft }> {
  const formData = new FormData()
  formData.append('file', file)
  if (targetRole && targetRole.trim()) {
    formData.append('targetRole', targetRole.trim())
  }

  const res = await apiUpload<AiDraftResult>('/api/v1/ai/parse-resume', formData)
  return {
    ...res,
    draft: res.resume,
  }
}

export type RefineDraftParams = {
  text: string
  targetRole?: string | null
  jobDescription?: string | null
  draft: ResumeDraft
  answers: AiAnswer[] | { question: string; answer: string }[]
}

export async function refineDraft(
  textOrParams: string | RefineDraftParams,
  targetRole?: string | null,
  jobDescription?: string | null,
  draft?: ResumeDraft,
  answers?: AiAnswer[],
): Promise<ResumeDraft & AiDraftResult & { draft: ResumeDraft }> {
  const p =
    typeof textOrParams === 'object'
      ? textOrParams
      : {
          text: textOrParams,
          targetRole,
          jobDescription,
          draft: draft!,
          answers: answers ?? [],
        }

  const res = await api<AiDraftResult>('/api/v1/ai/refine', {
    method: 'POST',
    body: {
      text: p.text.trim(),
      targetRole: orNull(p.targetRole),
      jobDescription: orNull(p.jobDescription),
      draft: p.draft,
      answers: p.answers,
    },
  })

  return {
    ...res.resume,
    ...res,
    draft: res.resume,
  }
}

export function previewHtml(draft: ResumeDraft): Promise<string> {
  return apiText('/api/v1/preview', { method: 'POST', body: draft })
}

export function saveResume(draft: ResumeDraft): Promise<SavedResume> {
  return api<SavedResume>('/api/v1/resumes', { method: 'POST', body: draft })
}

export function downloadPdf(id: string): Promise<Blob> {
  return apiBlob(`/api/v1/resumes/${id}/pdf`)
}

export type AssistantMessage = {
  role: 'user' | 'assistant'
  text: string
}

export type AssistantChatParams = {
  message: string
  history?: AssistantMessage[]
  currentRole?: string
  contextSnippet?: string
}

export type AssistantChatResponse = {
  reply: string
  suggestedFollowUps: string[]
  modelUsed: string
}

export function chatWithAssistant(params: AssistantChatParams): Promise<AssistantChatResponse> {
  return api<AssistantChatResponse>('/api/v1/ai/chat', {
    method: 'POST',
    body: params,
  })
}

export function enhanceBullet(params: EnhanceBulletRequest): Promise<EnhanceBulletResponse> {
  return api<EnhanceBulletResponse>('/api/v1/ai/enhance-bullet', {
    method: 'POST',
    body: params,
  })
}

export function tailorDraft(draft: ResumeDraft, jobDescription: string): Promise<TailorResumeResponse> {
  return api<TailorResumeResponse>('/api/v1/ai/tailor-draft', {
    method: 'POST',
    body: { draft, jobDescription },
  })
}

export function checkDraftAts(draft: ResumeDraft, jobDescription?: string): Promise<AtsReport> {
  return api<AtsReport>('/api/v1/resumes/draft-ats-check', {
    method: 'POST',
    body: { draft, jobDescription: jobDescription || null },
  })
}

export function generateCoverLetter(params: CoverLetterRequest): Promise<CoverLetterResponse> {
  return api<CoverLetterResponse>('/api/v1/ai/cover-letter', {
    method: 'POST',
    body: params,
  })
}

export function toggleShareResume(id: string, makePublic?: boolean): Promise<ShareResumeResponse> {
  const query = makePublic !== undefined ? `?makePublic=${makePublic}` : ''
  return api<ShareResumeResponse>(`/api/v1/resumes/${id}/share${query}`, {
    method: 'POST',
  })
}

export function fetchPublicResume(shareSlug: string): Promise<PublicResumeDto> {
  return api<PublicResumeDto>(`/api/v1/public/resumes/${shareSlug}`, {
    auth: false,
  })
}
