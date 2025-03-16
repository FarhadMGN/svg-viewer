
/**
 * tabs controller
 */
class TabsController {
  /**
   * Хэш-таблица для запоминания загруженных contentScript-ов
   * Ключ - id вкладки браузера. Если id вкладки присутствует в данной таблице, то делаем
   * вывод, что contentScript на данной вкладке загрузился
   */
  tabsWithLoadedSidebar: { [key: number]: boolean } = {}

  /**
   * Список contentScript-ов, которые нужно динамически загружать на страницу
   */
  targetContentScriptFiles: string[] = []

  /**
   * Отмечаем вкладку, на которой contentScript был загружен
   * @param tabId - id вкладки браузера
   */
  setTabContentScriptLoaded = (tabId: number | undefined) => {
    if (!tabId) return
    this.tabsWithLoadedSidebar[tabId] = true
  }

  /**
   * Проверяем, загружался ли contentScript на данной вкладке
   * @param tabId - id вкладки браузера
   */
  isTabContentScriptLoaded = (tabId: number): boolean => {
    if (!tabId) return false

    return this.tabsWithLoadedSidebar[tabId]
  }

  /**
   * Устанавливаем файлы contentScript, которые будут подгружаться на страницу
   * @param files - список (либо один) файлов contentScript
   */
  setContentScriptFiles = (files: string[] | undefined): void => {
    if (!files) return
    this.targetContentScriptFiles = [...this.targetContentScriptFiles, ...files]
  }

  /**
   * Подгружаем файлы contentScript на конкретную вкладку
   * @param tabId - id вкладки браузера
   */
  injectContentScriptFilesToTab = async (tabId: number): Promise<void> => {
    if (!tabId || this.targetContentScriptFiles.length == 0) return Promise.reject()

    return chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        files: [...this.targetContentScriptFiles],
      })
      .then(() => {
        this.setTabContentScriptLoaded(tabId)
      })
  }
}

const tabsController: TabsController = new TabsController()

/**
 * Получаем название contentScript-файла, который будет динамически подгружаться на страницу когда
 * расширение уже установлено, а текущая вкладка не перегружалась.
 *
 * Используем порядок файлов из manifest.json для получаения нужного, так как при разработке и при
 * продакшн-сборке названия файлов в манифестах совпадать не будут.
 *
 * Например:
 *  - при разработке js: ['src/contentScript/Sidebar/index.tsx']
 *  - при сборке  "js": ["assets/index.tsx-loader-ef2a399d.js"]
 *
 */
const contentScriptFile1 = chrome.runtime.getManifest()?.content_scripts?.[0]?.js
// const contentScriptFile2 = chrome.runtime.getManifest()?.content_scripts?.[1]?.js
tabsController.setContentScriptFiles(contentScriptFile1)
// tabsController.setContentScriptFiles(contentScriptFile2) // for draggble widget


/**
 * Обрабатываем активацию табы браузера.
 * Если TabsController ничего не знает, о табе браузера, которая была активирована, то это значит,
 * что она не присылала сообщения от contentScript-a. Такая ситуация возникает когда расширение установлено,
 * но не все "старые вкладки" обновлены. Поэтому, чтобы пользователь не переживал, мы динамически подгружаем
 * нужные файлы contentScript на активированную вкладку за исключением вкладок, на которых мы не можем этого
 * сделать, например chromewebstore.google.com, chrome://settings/ и тд.
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)

  if (tab.url && tab.url.includes('http') && !tab.url.includes('chromewebstore.google.com')) {
    const tabId: number = activeInfo.tabId

    if (!tabsController.isTabContentScriptLoaded(tabId)) {
      await tabsController.injectContentScriptFilesToTab(tabId)
    }
  }
})

