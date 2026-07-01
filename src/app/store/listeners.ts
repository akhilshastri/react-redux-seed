import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'

import { queryClient } from '@/shared/api'
import { loggedOut, sessionExpired } from '@/shared/store'

import { type RootState } from './root-reducer'
import { type AppDispatch } from './store'

/**
 * Cross-slice SIDE EFFECTS live here (the one place). Pure cross-slice state
 * coupling lives in each reacting slice's `extraReducers` (ui + auth reset).
 * Navigation on logout is declarative via <ProtectedRoute>, so no router import.
 *
 * Type-only imports of RootState/AppDispatch are erased at runtime — no cycle
 * with store.ts (which imports this middleware as a value).
 */
export const listenerMiddleware = createListenerMiddleware()

export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>()

// On logout / session expiry: drop all server-state cache. Idempotent, and
// cancelActiveListeners() dedupes a session-expired-during-logout race.
startAppListening({
  matcher: isAnyOf(loggedOut, sessionExpired),
  effect: (_action, api) => {
    api.cancelActiveListeners()
    queryClient.clear()
  },
})
