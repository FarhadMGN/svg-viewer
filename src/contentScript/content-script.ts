import { WorkerMessageTypes } from '../background/types'

/**
 * Notify the service worker (background.js) about contentScript loaded
 */
const tm = setTimeout(() => {
  chrome.runtime.sendMessage({ type: WorkerMessageTypes.sidebarLoaded, payload: true })
  clearTimeout(tm)
}, 500)

// for svg picker
// Получаем сообщения от sidebar
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'activate') {
    const svgs = Array.from(document.querySelectorAll('svg')).map((el) => el.outerHTML)
    console.log('handle activate', svgs.length);
    
    chrome.runtime.sendMessage({ action: 'sendSvgCode', svgCode:  svgs});
  }
});

console.log('content script loading');
