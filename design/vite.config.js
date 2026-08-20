import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run dev`          -> dev server on a pinned port
// `npm run build`        -> normal dist/
// `npm run build:single` -> one self-contained dist/index.html (the shareable preview)
export default defineConfig({
  plugins: [react(), ...(process.env.SINGLEFILE ? [viteSingleFile()] : [])],
  server: {
    // Pinned deliberately: Vite's default 5173 is taken on this machine, and its
    // silent fallback to 5174/5175/... makes it easy to open the wrong app.
    // strictPort makes a clash fail loudly instead.
    port: 5183,
    strictPort: true,
    open: true,
  },
  preview: { port: 4173, strictPort: true },
  build: { cssCodeSplit: false, assetsInlineLimit: 100000000 },
})
