import { defineConfig } from 'vite'
import type { Plugin as PostcssPlugin } from 'postcss'
import react from '@vitejs/plugin-react'

// Builds the hero as one self-contained script + stylesheet straight into the
// Shopify theme's flat assets folder. Every rule is scoped under `.pd3d` so the
// prototype's globals (:root, *, h1, a, button) cannot leak into the storefront.
const scope: PostcssPlugin = {
  postcssPlugin: 'pd3d-scope',
  Once(root) {
    root.walkAtRules('font-face', rule => { rule.remove() }) // declared in the section with asset_url
    root.walkRules(rule => {
      if (rule.parent?.type === 'atrule' && /keyframes/.test((rule.parent as { name: string }).name)) return
      const selectors = rule.selectors.flatMap(selector => {
        if (selector.startsWith('.pd3d')) return [selector]
        if (selector === ':root') return ['.pd3d']
        if (selector === 'body') return []
        if (selector === '*') return ['.pd3d', '.pd3d *']
        return [`.pd3d ${selector}`]
      })
      if (selectors.length) rule.selectors = selectors
      else rule.remove()
    })
  },
}

export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': '"production"' },
  css: { postcss: { plugins: [scope] } },
  publicDir: false,
  build: {
    outDir: '../../theme/prodani/assets',
    emptyOutDir: false,
    lib: { entry: 'src/theme-entry.tsx', formats: ['iife'], name: 'ProDani3DHero', fileName: () => 'prodani-3d-hero.js', cssFileName: 'prodani-3d-hero' },
  },
})
