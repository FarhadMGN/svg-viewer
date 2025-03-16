import { WorkerMessageTypes } from '../background/types'

/**
 * Notify the service worker (background.js) about contentScript loaded
 */
const tm = setTimeout(() => {
  chrome.runtime.sendMessage({ type: WorkerMessageTypes.sidebarLoaded, payload: true })
  clearTimeout(tm)
}, 500)

