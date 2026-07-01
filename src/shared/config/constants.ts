import { env } from './env'

export const APP_NAME = env.VITE_APP_NAME
export const API_BASE_URL = env.VITE_API_BASE_URL

/**
 * Whether to start the MSW mock backend. The one switch that swaps mock ↔ real:
 * unset → mock in dev only; `VITE_API_MOCK=false` → real API even in dev.
 */
export const ENABLE_MOCK_API =
  env.VITE_API_MOCK === undefined ? import.meta.env.DEV : env.VITE_API_MOCK === 'true'
