import { registerSW } from 'virtual:pwa-register'

import { store } from '@/app/store'
import { showUpdateToast } from '@/shared/store'

let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined

/** Registers the Workbox SW (prod only). A new build → ui/showUpdateToast. */
export const registerPwa = () => {
  updateSW = registerSW({
    onNeedRefresh() {
      store.dispatch(showUpdateToast())
    },
  })
}

/** Called by the update toast's button: activate the new SW and reload. */
export const applyUpdate = () => updateSW?.(true)
