import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` emits a normal dist/.
// `SINGLEFILE=1 npm run build` inlines everything into one dist/index.html,
// which is what gets published as the shareable client preview.
export default defineConfig({
  plugins: [react(), ...(process.env.SINGLEFILE ? [viteSingleFile()] : [])],
  build: { cssCodeSplit: false, assetsInlineLimit: 100000000 },
})
