import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The deliberately lazy-loaded Three.js engine is ~136KB gzipped.
  build: { chunkSizeWarningLimit: 600, rolldownOptions: { output: { manualChunks(id) {
    if (id.includes('node_modules/three/')) return 'three'
    if (id.includes('node_modules/gsap/')) return 'motion'
  } } } },
})
