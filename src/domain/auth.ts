import { z } from 'zod'

import { userSchema } from './user'

export const loginInputSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginInput = z.infer<typeof loginInputSchema>

/** Login/refresh response: an in-memory access token + the (non-sensitive) user. */
export const sessionSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
})
export type Session = z.infer<typeof sessionSchema>
