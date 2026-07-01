import { type PayloadAction, createSlice } from '@reduxjs/toolkit'

export type SortDir = 'asc' | 'desc'

/** Client-only grid UI state (server data lives in TanStack Query). */
export interface UsersUiState {
  search: string
  sortBy: string
  sortDir: SortDir
  page: number
  pageSize: number
  selectedIds: string[]
}

const initialState: UsersUiState = {
  search: '',
  sortBy: 'name',
  sortDir: 'asc',
  page: 0,
  pageSize: 25,
  selectedIds: [],
}

// Changing the query resets the page + selection so selection stays within view.
export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
      state.page = 0
      state.selectedIds = []
    },
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortDir: SortDir }>) => {
      state.sortBy = action.payload.sortBy
      state.sortDir = action.payload.sortDir
      state.page = 0
      state.selectedIds = []
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
      state.selectedIds = []
    },
    setSelectedIds: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload
    },
    clearSelection: (state) => {
      state.selectedIds = []
    },
  },
  selectors: {
    selectUsersUi: (state) => state,
    selectSelectedIds: (state) => state.selectedIds,
  },
})

export const { setSearch, setSorting, setPage, setSelectedIds, clearSelection } = usersSlice.actions
export const { selectUsersUi, selectSelectedIds } = usersSlice.selectors
