import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest'
import { viteStaticCopy } from 'vite-plugin-static-copy'


// https://vite.dev/config/
export default defineConfig({
  plugins: [crx({ manifest }), react(), viteStaticCopy({
    targets: [
      {
        src: 'public/icons/*',
        dest: 'icons'
      },
      {
        src: 'public/_locales/*',
        dest: '_locales'
      },
    ]
  })],
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/chunk-[hash].js',
      },
    }
  }
})
