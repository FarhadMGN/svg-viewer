export function isChromeExtension() {
  return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id
}
