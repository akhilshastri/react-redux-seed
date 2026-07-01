import { type RequestHandler } from 'msw'

// Auto-discovery: every `handlers/*.ts` (except this index) that exports an
// array of handlers is collected. A scaffolded handler wires in with zero edits.
const modules = import.meta.glob<Record<string, unknown>>(['./*.ts', '!./index.ts'], {
  eager: true,
})

export const handlers: RequestHandler[] = Object.values(modules).flatMap((module) =>
  Object.values(module)
    .filter((value): value is RequestHandler[] => Array.isArray(value))
    .flat(),
)
