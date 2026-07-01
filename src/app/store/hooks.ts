import { useDispatch, useSelector, useStore } from 'react-redux'

import { type AppDispatch, type AppStore, type RootState } from './store'

// The one sanctioned upward import: any layer may use these typed hooks,
// because the store is the app's single runtime singleton (plan §3, F22).
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()
