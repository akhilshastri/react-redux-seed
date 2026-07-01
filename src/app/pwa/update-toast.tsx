import { useAppDispatch, useAppSelector } from '@/app/store'
import { dismissUpdateToast, selectUpdateAvailable } from '@/shared/store'
import { Button } from '@/shared/ui'

import { applyUpdate } from './register-pwa'

export const UpdateToast = () => {
  const show = useAppSelector(selectUpdateAvailable)
  const dispatch = useAppDispatch()
  if (!show) return null

  return (
    <div className="bg-background fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg border p-4 shadow-lg">
      <span className="text-sm">A new version is available.</span>
      <Button
        size="sm"
        onClick={() => {
          void applyUpdate()
          dispatch(dismissUpdateToast())
        }}
      >
        Refresh
      </Button>
    </div>
  )
}
