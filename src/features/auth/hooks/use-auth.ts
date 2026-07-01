import { useAppSelector } from '@/app/store'

import { selectAuthStatus, selectAuthUser } from '../store/auth-slice'

export const useAuth = () => {
  const status = useAppSelector(selectAuthStatus)
  const user = useAppSelector(selectAuthUser)
  return { status, user, isAuthenticated: status === 'authenticated' }
}
