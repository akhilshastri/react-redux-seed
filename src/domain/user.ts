import { z } from 'zod'

import { roleSchema } from './rbac'

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  roles: z.array(roleSchema),
})

export type User = z.infer<typeof userSchema>

/** Create/edit form shape — a single primary role, stored as the `roles` array. */
export const userInputSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Enter a valid email'),
  role: roleSchema,
})

export type UserInput = z.infer<typeof userInputSchema>
