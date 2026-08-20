/* Builds src/fonts.css with every face inlined as base64.
   - Damion + Fugaz One come from Google Fonts (both OFL).
   - Konnect is ProDani's own licensed face, fetched from their storefront CDN at
     build time. The binaries are NEVER committed — this script re-fetches them,
     so nothing proprietary is redistributed through this repo. */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36'
const get = (url, headers = []) =>
  execFileSync('curl', ['-sS', '-L', '-A', UA, ...headers.flatMap(h => ['-H', h]), url],
    { maxBuffer: 64 * 1024 * 1024, encoding: 'buffer' })

const out = []
let total = 0

/* ---- 1. Google faces, latin subset only ---- */
const gcss = get('https://fonts.googleapis.com/css2?family=Damion&family=Fugaz+One&display=swap').toString()
for (const block of gcss.match(/@font-face\s*\{[^}]*\}/g) || []) {
  const ur = block.match(/unicode-range:\s*([^;]+);/)
  if (ur && !ur[1].includes('U+0000-00FF')) continue          // skip cyrillic/greek/vietnamese
  const fam = block.match(/font-family:\s*'([^']+)'/)[1]
  const wt = (block.match(/font-weight:\s*(\d+)/) || [, '400'])[1]
  const url = block.match(/url\((https:\/\/[^)]+\.woff2)\)/)[1]
  const buf = get(url)
  total += buf.length
  out.push(`@font-face{font-family:'${fam}';font-style:normal;font-weight:${wt};font-display:swap;src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');}`)
  console.log(`  ${fam.padEnd(16)} ${wt}   ${String(Math.round(buf.length / 1024)).padStart(4)} KB  (woff2)`)
}

/* ---- 2. Konnect, from ProDani's own CDN ---- */
const CDN = 'https://cdn.shopify.com/s/files/1/0792/9475/9222/files/'
const KONNECT = [
  ['KonnectMedium.otf?v=1689183432', 500],
  ['KonnectSemiBold.otf?v=1689183432', 600],
  ['KonnectBold.otf?v=1689183432', 700],
  ['KonnectExtraBold.otf?v=1689100216', 800],
]
for (const [file, wt] of KONNECT) {
  const buf = get(CDN + file)
  if (buf.length < 5000) { console.warn(`  !! Konnect ${wt} looks wrong (${buf.length}B) — skipped`); continue }
  total += buf.length
  out.push(`@font-face{font-family:'Konnect';font-style:normal;font-weight:${wt};font-display:swap;src:url(data:font/otf;base64,${buf.toString('base64')}) format('opentype');}`)
  console.log(`  ${'Konnect'.padEnd(16)} ${wt}   ${String(Math.round(buf.length / 1024)).padStart(4)} KB  (otf)`)
}

const css = out.join('\n')
writeFileSync(join(here, '../src/fonts.css'), css)
console.log(`\n  ${out.length} faces · ${Math.round(total / 1024)} KB raw · ${Math.round(css.length / 1024)} KB inlined`)
