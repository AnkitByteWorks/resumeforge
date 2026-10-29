const TOKEN_KEY = 'rf_token'

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

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn
}

interface RequestOptions {
  method?: string
  body?: unknown
  /** Set to false for login and signup so no token is ever sent. */
  auth?: boolean
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
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
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }

  if (!res.ok) {
    if (res.status === 401 && auth && onUnauthorized) onUnauthorized()
    throw new ApiError(res.status, await readError(res))
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
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
