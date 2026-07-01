import { createAction } from '@reduxjs/toolkit'

/**
 * App-wide session lifecycle signals. Defined in `shared` so both the `ui`
 * slice (shared) and the `auth` slice (feature) can react via `extraReducers`
 * without shared importing a feature — the cross-slice contract lives here.
 */
export const loggedOut = createAction('session/loggedOut')
export const sessionExpired = createAction('session/sessionExpired')
