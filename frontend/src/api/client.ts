const TOKEN_KEY = 'rf_token'
const REQUEST_TIMEOUT_MS = 150_000 // AI calls can take a while, especially when a model falls back

export const tokenStore = {
  get(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string): void {
    try {
      sessionStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* storage unavailable: the user will simply have to log in again */
    }
  },
  clear(): void {
    try {
      sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  },
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  return err instanceof Error ? err.message : fallback
}

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn
}

interface RequestOptions {
  method?: string
  body?: unknown
  /** Set to false for login, signup and public endpoints so no token is sent. */
  auth?: boolean
}

async function send(path: string, options: RequestOptions = {}): Promise<Response> {
  const { method = 'GET', body, auth = true } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = tokenStore.get()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new ApiError(0, 'The request took too long. Please try again.')
    }
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }

  if (!res.ok) {
    if (res.status === 401 && auth && onUnauthorized) onUnauthorized()
    throw new ApiError(res.status, await readError(res))
  }
  return res
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await send(path, options)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function apiText(path: string, options: RequestOptions = {}): Promise<string> {
  return (await send(path, options)).text()
}

export async function apiBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
  return (await send(path, options)).blob()
}

async function readError(res: Response): Promise<string> {
  try {
    const problem = await res.json()
    if (problem && typeof problem.errors === 'object' && problem.errors !== null) {
      return Object.entries(problem.errors as Record<string, string>)
        .map(([field, message]) => `${field}: ${message}`)
        .join('\n')
    }
    if (problem && typeof problem.detail === 'string') return problem.detail
  } catch {
    /* response had no JSON body */
  }
  return `Request failed (${res.status})`
}
