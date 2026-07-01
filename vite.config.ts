import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// React Compiler (§4.7): react() first, then the Babel/compiler pass via
// @rolldown/plugin-babel (plugin-react v6 no longer runs Babel internally).
// Escape hatch: if this pass ever breaks the build/HMR, drop the babel() line
// — the app is identical, just unmemoized.
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  build: { sourcemap: true },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
