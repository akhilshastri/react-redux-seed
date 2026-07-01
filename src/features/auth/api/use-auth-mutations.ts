import { useMutation } from '@tanstack/react-query'

import { useAppDispatch } from '@/app/store'
import { setAccessToken } from '@/shared/api'
import { loggedOut } from '@/shared/store'

import { loggedIn } from '../store/auth-slice'
import { loginRequest, logoutRequest } from './auth-api'

export const useLogin = () => {
  const dispatch = useAppDispatch()
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (session) => {
      setAccessToken(session.accessToken)
      dispatch(loggedIn(session.user))
    },
  })
}

export const useLogout = () => {
  const dispatch = useAppDispatch()
  return useMutation({
    mutationFn: logoutRequest,
    // Tear down locally regardless of the network result.
    onSettled: () => {
      setAccessToken(null)
      dispatch(loggedOut())
    },
  })
}
