/**
 * In-memory access-token holder — NOT the Redux store, NOT localStorage.
 * Keeping it here means the token is never persisted and never appears in
 * Redux DevTools. The auth feature sets it; the http client reads it.
 */
let accessToken: string | null = null

export const getAccessToken = (): string | null => accessToken

export const setAccessToken = (token: string | null): void => {
  accessToken = token
}
