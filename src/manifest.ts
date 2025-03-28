import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'
// import { getI18nTextEmulation } from './utils/i18n'


export default defineManifest({
  name: '__MSG_appName__',
  description: '__MSG_shortDesc__',
  version: packageData.version,
  default_locale: 'en',
  manifest_version: 3,
  icons: {
        "16": "icons/16x16.png",
        "48": "icons/48x48.png",
        "64": "icons/64x64.png",
        "96": "icons/96x96.png",
        "128": "icons/128x128.png"
    },
  action: {
    default_icon: 'icons/48x48.png',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  side_panel: {
    default_path: 'sidepanel.html',
  },
  web_accessible_resources: [
    {
      resources: ['icons/16x16.png', 'icons/48x48.png', 'icons/64x64.png', 'icons/96x96.png', 'icons/128x128.png'],
      matches: [],
    },
  ],
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/contentScript/content-script.ts'],
      run_at: 'document_end',
    },
  ],
  permissions: ['storage', 'sidePanel', "activeTab", "scripting"],
  host_permissions: [
    "<all_urls>"
  ]
})
