import { configureStore } from '@reduxjs/toolkit'

import { setSessionExpiredHandler } from '@/shared/api'
import { loadPersistedState, savePersistedState, sessionExpired } from '@/shared/store'

import { listenerMiddleware } from './listeners'
import { rootReducer } from './root-reducer'

export const makeStore = (preloadedState = loadPersistedState()) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  })

export const store = makeStore()

// Persist the whitelist on change. Only theme — the session is restored purely
// via the (mock) httpOnly refresh cookie, so nothing auth-related is persisted.
store.subscribe(() => {
  savePersistedState({ theme: store.getState().theme })
})

// The http client signals session expiry here; the listener middleware reacts.
setSessionExpiredHandler(() => {
  store.dispatch(sessionExpired())
})

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
