export interface User {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  user: User
}

export interface ResumeSummary {
  id: string
  title: string
  templateId: string
  updatedAt: string | null
  atsScore?: number
}

export interface TemplateInfo {
  id: string
  name: string
  description: string
  hasPhoto?: boolean
  category?: string
  accentColor?: string
}

export interface DraftPersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  portfolio: string
  photoUrl?: string
  headline?: string
}

export interface DraftExperience {
  company: string
  role: string
  startDate: string
  endDate: string
  current: boolean
  bullets: string[]
}

export interface DraftProject {
  name: string
  techStack: string
  link: string
  bullets: string[]
}

export interface DraftEducation {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  score: string
}

export interface ResumeDraft {
  title: string
  templateId: string
  personalInfo: DraftPersonalInfo
  summary: string
  experience: DraftExperience[]
  projects: DraftProject[]
  education: DraftEducation[]
  skills: string[]
  certifications: string[]
}

export interface AiQuestion {
  id: string
  question: string
}

export interface AiDraftResult {
  resume: ResumeDraft
  questions: AiQuestion[]
}

export interface AiAnswer {
  question: string
  answer: string
}

export interface SavedResume {
  id: string
}

export interface EnhanceBulletRequest {
  bullet: string
  role?: string
  techStack?: string
}

export interface EnhanceBulletResponse {
  originalBullet: string
  enhancedBullet: string
  alternativeOptions: string[]
  actionVerbUsed: string
  explanation: string
  modelUsed: string
}

export interface BulletImprovement {
  originalBullet: string
  suggestedBullet: string
  reason: string
}

export interface TailorResumeResponse {
  matchedSkills: string[]
  missingSkills: string[]
  tailoredSummary: string
  suggestedBulletImprovements: BulletImprovement[]
  overallAdvice: string
  modelUsed: string
}

export interface AtsCategoryScore {
  name: string
  score: number
  maxScore: number
  issues: string[]
}

export interface AtsReport {
  score: number
  grade: string
  keywordsAnalyzed: boolean
  categories: AtsCategoryScore[]
  keywords?: {
    matchPercent: number
    matched: string[]
    missing: string[]
  }
  suggestions: string[]
}
