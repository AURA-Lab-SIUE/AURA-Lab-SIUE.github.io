import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Mirrors methodosync/vite.config.ts: root = src/ so the source index.html is
// never overwritten by the build, which emits into the folder root alongside it.
export default defineConfig({
  root: resolve(__dirname, 'src'),
  plugins: [react()],
  base: '/litmap/',
  build: {
    outDir: resolve(__dirname),
    emptyOutDir: false,
    assetsDir: 'assets',
    sourcemap: false,
  },
})
