import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppProviders } from '@/app/providers'
import { registerPwa } from '@/app/pwa'
import { ENABLE_MOCK_API } from '@/shared/config/constants'
import '@/styles/globals.css'

/**
 * The mock backend is opt-out: on in dev, off in prod, or forced either way with
 * VITE_API_MOCK. Set it to `false` (+ point VITE_API_BASE_URL at a real API) to
 * run against a real backend — see docs/how-to/08-real-backend.
 */
const enableMocking = async () => {
  if (!ENABLE_MOCK_API) return
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
