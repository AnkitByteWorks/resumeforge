import { api, apiBlob, apiText } from './client'
import type { AiAnswer, AiDraftResult, ResumeDraft, ResumeSummary, SavedResume, TemplateInfo } from '../types'

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
