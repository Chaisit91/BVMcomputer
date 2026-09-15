import { AiServiceError } from '../../lib/errors'

const DEFAULT_AI_SERVICE_URL = 'http://127.0.0.1:8000'
const REQUEST_TIMEOUT_MS = 10_000

function baseUrl() {
  return (process.env.AI_SERVICE_URL ?? DEFAULT_AI_SERVICE_URL).replace(/\/+$/, '')
}

function tokenHeaders() {
  const token = process.env.AI_SERVICE_TOKEN?.trim()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path: string, init: RequestInit = {}) {
  let response: Response
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...tokenHeaders(),
        ...init.headers,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new AiServiceError('AI compatibility service is unavailable')
  }

  const body = await response.json().catch(() => null) as { error?: unknown } | null
  if (!response.ok) {
    const message = typeof body?.error === 'string' ? body.error : 'AI compatibility service failed'
    throw new AiServiceError(message, response.status >= 400 && response.status < 500 ? response.status : 503)
  }
  return body
}

export const aiService = {
  health: () => request('/health'),
  search: (query: URLSearchParams) => request(`/search?${query.toString()}`),
  recommend: (query: URLSearchParams) => request(`/recommend?${query.toString()}`),
  recommendUpgrade: (data: unknown) => request('/upgrade-recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
}
