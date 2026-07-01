import { type PayloadAction, createSlice, isAnyOf } from '@reduxjs/toolkit'

import { type User } from '@/domain'
import { loggedOut, sessionExpired } from '@/shared/store'

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  status: AuthStatus
  user: User | null
}

const initialState: AuthState = { status: 'unknown', user: null }

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedIn: (state, action: PayloadAction<User>) => {
      state.status = 'authenticated'
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    // React to the shared session lifecycle signals (extraReducers, not imports).
    builder.addMatcher(isAnyOf(loggedOut, sessionExpired), (state) => {
      state.status = 'unauthenticated'
      state.user = null
    })
  },
  selectors: {
    selectAuthStatus: (state) => state.status,
    selectAuthUser: (state) => state.user,
    selectAuthRoles: (state) => state.user?.roles ?? [],
  },
})

export const { loggedIn } = authSlice.actions
export const { selectAuthStatus, selectAuthUser, selectAuthRoles } = authSlice.selectors
