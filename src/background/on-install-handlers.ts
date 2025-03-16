import { SERVER_URL } from "../utils/constants"

/**
 * Сюда добавляем хэндлеры установки расширения
 *
 * Например:
 * - после установки расширения открываем страницу благодарности с краткими пояснениями, как
 * расширение работает
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: `${SERVER_URL}/welcome`,
    })
  } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    // TODO: update
  } else if (details.reason === chrome.runtime.OnInstalledReason.CHROME_UPDATE) {
    // TODO: update
  } else if (details.reason === chrome.runtime.OnInstalledReason.SHARED_MODULE_UPDATE) {
    // TODO: update
  }
})

