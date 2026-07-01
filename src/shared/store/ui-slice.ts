import { type PayloadAction, createSlice, isAnyOf } from '@reduxjs/toolkit'

import { loggedOut, sessionExpired } from './session-actions'

export interface UiState {
  sidebarOpen: boolean
  offline: boolean
  updateAvailable: boolean
}

const initialState: UiState = {
  sidebarOpen: true,
  offline: false,
  updateAvailable: false,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setOffline: (state, action: PayloadAction<boolean>) => {
      state.offline = action.payload
    },
    showUpdateToast: (state) => {
      state.updateAvailable = true
    },
    dismissUpdateToast: (state) => {
      state.updateAvailable = false
    },
    resetUi: () => initialState,
  },
  extraReducers: (builder) => {
    // Pure cross-slice state coupling: reset UI when the session ends.
    builder.addMatcher(isAnyOf(loggedOut, sessionExpired), () => initialState)
  },
  selectors: {
    selectSidebarOpen: (state) => state.sidebarOpen,
    selectOffline: (state) => state.offline,
    selectUpdateAvailable: (state) => state.updateAvailable,
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setOffline,
  showUpdateToast,
  dismissUpdateToast,
  resetUi,
} = uiSlice.actions

export const { selectSidebarOpen, selectOffline, selectUpdateAvailable } = uiSlice.selectors
