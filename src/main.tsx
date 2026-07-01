import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppProviders } from '@/app/providers'
import '@/styles/globals.css'

/**
 * MSW is the backend for this seed, so it must be ready before first render —
 * anything that calls the API at startup would otherwise race an unstarted
 * worker (plan §9 timing rule).
 */
const enableMocking = async () => {
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  )
})
