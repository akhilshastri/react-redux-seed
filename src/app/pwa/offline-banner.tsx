import { useAppSelector } from '@/app/store'
import { selectOffline } from '@/shared/store'

export const OfflineBanner = () => {
  const offline = useAppSelector(selectOffline)
  if (!offline) return null

  return (
    <div className="bg-destructive text-destructive-foreground fixed inset-x-0 top-0 z-50 px-4 py-1 text-center text-sm">
      You are offline — data may be unavailable.
    </div>
  )
}
