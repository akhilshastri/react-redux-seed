import { setupServer } from 'msw/node'

import { handlers } from './handlers'

// Used by Vitest (Node) in Phase 5 — no service worker.
export const server = setupServer(...handlers)
