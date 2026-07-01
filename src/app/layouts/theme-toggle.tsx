import { Monitor, Moon, Sun } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '@/app/store'
import { type ThemeMode, selectThemeMode, setThemeMode } from '@/shared/store'
import { Button } from '@/shared/ui'

const order: ThemeMode[] = ['light', 'dark', 'system']
const icon = { light: Sun, dark: Moon, system: Monitor } as const

export const ThemeToggle = () => {
  const mode = useAppSelector(selectThemeMode)
  const dispatch = useAppDispatch()
  const Icon = icon[mode]
  const next = order[(order.indexOf(mode) + 1) % order.length] as ThemeMode

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={`Theme: ${mode}. Switch to ${next}.`}
      title={`Theme: ${mode}`}
      onClick={() => dispatch(setThemeMode(next))}
    >
      <Icon className="size-4" />
    </Button>
  )
}
