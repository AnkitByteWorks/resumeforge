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
}
