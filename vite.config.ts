import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { existsSync, rmSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { type Plugin, defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Only the Workbox SW may ship in prod — strip the dev/test MSW worker from the
// build so nothing registers a second service worker at '/' (plan §4.8).
const excludeMswWorker = (): Plugin => ({
  name: 'exclude-msw-worker',
  apply: 'build',
  closeBundle() {
    const worker = fileURLToPath(new URL('./dist/mockServiceWorker.js', import.meta.url))
    if (existsSync(worker)) rmSync(worker)
  },
})

// React Compiler (§4.7): react() first, then the Babel/compiler pass via
// @rolldown/plugin-babel (plugin-react v6 no longer runs Babel internally).
// Escape hatch: if this pass ever breaks the build/HMR, drop the babel() line.
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false, // registered manually so onNeedRefresh can hit the store
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'React Redux Seed',
        short_name: 'RRSeed',
        description: 'Enterprise React + Redux Toolkit seed',
        theme_color: '#0a0a0a',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        globIgnores: ['**/mockServiceWorker.js'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/], // API is never SW-cached (Query owns it)
      },
      devOptions: { enabled: false }, // dev uses MSW's SW, not the PWA SW
    }),
    excludeMswWorker(),
  ],
  build: { sourcemap: true },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
