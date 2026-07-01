import { type z } from 'zod'

import { API_BASE_URL } from '@/shared/config/constants'

import { getAccessToken, setAccessToken } from './access-token'
import { ApiError } from './api-error'

export interface HttpOptions<T = unknown> extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Optional Zod schema — when set, the response is validated at the boundary. */
  schema?: z.ZodType<T>
}

// Registered by the app (dispatches `sessionExpired`) — keeps this module
// decoupled from the store/features (shared must not import upward).
let onSessionExpired: (() => void) | null = null
export const setSessionExpiredHandler = (handler: (() => void) | null): void => {
  onSessionExpired = handler
}

// Single-flight refresh: concurrent 401s share one in-flight refresh promise,
// then each retries once — no refresh storm (the classic concurrent-401 bug).
let refreshInFlight: Promise<boolean> | null = null

const runRefresh = (): Promise<boolean> => {
  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) throw new ApiError(response.status, 'Refresh failed')
      const data = (await response.json()) as { accessToken: string }
      setAccessToken(data.accessToken)
      return true
    } catch {
      setAccessToken(null)
      onSessionExpired?.()
      return false
    }
  })()
  const pending = refreshInFlight
  void pending.finally(() => {
    refreshInFlight = null
  })
  return pending
}

/**
 * Typed fetch wrapper: injects the in-memory access token, sends the (mock)
 * httpOnly refresh cookie via `credentials: 'include'`, retries once through a
 * single-flight refresh on 401, normalizes errors to ApiError, and (when a
 * `schema` is given) validates the response — so a drifting real API fails loudly.
 */
export const httpClient = async <T>(
  path: string,
  options: HttpOptions<T> = {},
  retry = true,
): Promise<T> => {
  const { body, schema, headers: headerInit, ...rest } = options
  const headers = new Headers(headerInit)

  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    const refreshed = await runRefresh()
    if (refreshed) return httpClient<T>(path, options, false)
  }

  if (!response.ok) {
    const data = await response.json().catch(() => undefined)
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : response.statusText
    throw new ApiError(response.status, message, data)
  }

  if (response.status === 204) return undefined as T
  const json = await response.json()
  return schema ? schema.parse(json) : (json as T)
}
