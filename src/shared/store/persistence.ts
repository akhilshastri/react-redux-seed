import { type ThemeState } from './theme-slice'

/**
 * Tiny localStorage persistence (whitelist only) — deliberately not redux-persist.
 * Only non-sensitive client state is persisted. The access token is never in the
 * store, so it can never land here (see shared/api/access-token).
 */
const STORAGE_KEY = 'rrs:state'

export interface PersistedState {
  theme?: ThemeState
}

export const loadPersistedState = (): PersistedState | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    return JSON.parse(raw) as PersistedState
  } catch {
    return undefined
  }
}

export const savePersistedState = (state: PersistedState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore write failures (private mode / quota)
  }
}
