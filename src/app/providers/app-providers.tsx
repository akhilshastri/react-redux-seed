import { useEffect } from 'react'

import { useAppDispatch } from '@/app/store'
import { loggedIn, refreshRequest } from '@/features/auth'
import { setAccessToken } from '@/shared/api'
import { sessionExpired, setOffline } from '@/shared/store'

import { QueryProvider } from './query-provider'
import { AppRouterProvider } from './router-provider'
import { StoreProvider } from './store-provider'
import { ThemeProvider } from './theme-provider'

/**
 * Startup bridges that need the store. Both run only after MSW is ready —
 * main.tsx awaits enableMocking() before rendering, so the cold-start refresh
 * can't race the mock backend (plan §9 timing rule).
 */
const AppBootstrap = () => {
  const dispatch = useAppDispatch()

  // Cold-start: restore the session via the (mock) httpOnly refresh cookie.
  useEffect(() => {
    let active = true
    refreshRequest()
      .then((session) => {
        if (!active) return
        setAccessToken(session.accessToken)
        dispatch(loggedIn(session.user))
      })
      .catch(() => {
        if (active) dispatch(sessionExpired())
      })
    return () => {
      active = false
    }
  }, [dispatch])

  // Live binding: window online/offline → ui slice.
  useEffect(() => {
    const update = () => dispatch(setOffline(!navigator.onLine))
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [dispatch])

  return null
}

export const AppProviders = () => {
  return (
    <StoreProvider>
      <QueryProvider>
        <ThemeProvider>
          <AppBootstrap />
          <AppRouterProvider />
        </ThemeProvider>
      </QueryProvider>
    </StoreProvider>
  )
}
