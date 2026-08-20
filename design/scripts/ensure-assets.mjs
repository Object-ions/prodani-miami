/* Runs on postinstall. Makes sure the two generated files exist so that
   `npm install && npm run dev` works with no further steps.

   - src/fonts.css        -> copied from the committed fonts.remote.css (network fonts)
   - src/data/images.json -> empty map; the app then falls back to the live CDN URLs
                             already present in catalog.json

   `npm run setup` overwrites both with fully inlined versions. That is only
   needed for an offline-capable or single-file build. */
import { existsSync, copyFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const fonts = join(here, '../src/fonts.css')
const images = join(here, '../src/data/images.json')

if (!existsSync(fonts)) {
  copyFileSync(join(here, '../src/fonts.remote.css'), fonts)
  console.log('  created src/fonts.css (network fonts — run `npm run setup` to inline)')
}
if (!existsSync(images)) {
  mkdirSync(dirname(images), { recursive: true })
  writeFileSync(images, '{}')
  console.log('  created src/data/images.json (empty — images load from the Shopify CDN)')
}
