import { type ReactNode, useEffect } from 'react'

import { useAppSelector } from '@/app/store'
import { selectThemeMode } from '@/shared/store'

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

/** Applies the resolved theme as `class="dark"` on <html>. */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const mode = useAppSelector(selectThemeMode)

  useEffect(() => {
    const isDark = mode === 'dark' || (mode === 'system' && prefersDark())
    document.documentElement.classList.toggle('dark', isDark)
  }, [mode])

  useEffect(() => {
    if (mode !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => document.documentElement.classList.toggle('dark', mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [mode])

  return <>{children}</>
}
