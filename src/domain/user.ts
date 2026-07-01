import { z } from 'zod'

import { roleSchema } from './rbac'

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  roles: z.array(roleSchema),
})

export type User = z.infer<typeof userSchema>
