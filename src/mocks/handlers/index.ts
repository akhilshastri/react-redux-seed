import { authHandlers } from './auth'
import { healthHandlers } from './health'

// Phase 4 switches this to import.meta.glob auto-discovery.
export const handlers = [...healthHandlers, ...authHandlers]
