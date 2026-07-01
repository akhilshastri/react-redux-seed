/** Typed path constants — no stringly-typed navigation. */
export const paths = {
  home: '/',
  login: '/login',
  admin: '/admin',
} as const

export type AppPath = (typeof paths)[keyof typeof paths]
