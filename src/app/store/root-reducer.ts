import { combineReducers } from '@reduxjs/toolkit'

import { authSlice } from '@/features/auth/store/auth-slice'
import { usersSlice } from '@/features/users/store/users-slice'
import { themeSlice } from '@/shared/store/theme-slice'
import { uiSlice } from '@/shared/store/ui-slice'

// Slice keys MUST equal each slice's `name` so colocated slice.selectors resolve.
export const rootReducer = combineReducers({
  auth: authSlice.reducer,
  users: usersSlice.reducer,
  theme: themeSlice.reducer,
  ui: uiSlice.reducer,
})

export type RootState = ReturnType<typeof rootReducer>
