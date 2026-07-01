import { z } from 'zod'

/**
 * Typed, fail-fast access to `import.meta.env`.
 * Parsed once at module load; a misconfigured env throws immediately
 * instead of surfacing as a confusing runtime bug later.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().default('/api'),
  VITE_APP_NAME: z.string().default('React Redux Seed'),
  // Controls whether the MSW mock backend starts. Unset → mock in dev, real API
  // in prod. Set 'false' to run dev against a real API (see docs/how-to/08).
  VITE_API_MOCK: z.enum(['true', 'false']).optional(),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.issues)
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
export type Env = typeof env
