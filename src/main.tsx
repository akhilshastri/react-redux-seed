import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppProviders } from '@/app/providers'
import { registerPwa } from '@/app/pwa'
import '@/styles/globals.css'

/**
 * MSW is the backend for dev + tests only. In a production build there is no
 * mock backend (data needs a real API); the Workbox SW owns prod instead.
 */
const enableMocking = async () => {
  if (!import.meta.env.DEV) return
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

void enableMocking().then(() => {
  registerPwa()
  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  )
})
