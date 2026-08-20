/* Downloads every catalog image, re-encodes to JPEG via macOS `sips`, and writes
   src/data/images.json as { key: dataURI }. This is what lets the single-file
   build render with zero network requests (required by the artifact CSP). */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const catalog = JSON.parse(readFileSync(join(here, '../src/data/catalog.json'), 'utf8'))
const tmp = mkdtempSync(join(tmpdir(), 'pd-img-'))

const STORY = 'https://prodanimiami.com/cdn/shop/collections/PRODANI_09.01.23_N.A_218_of_323.jpg'

const jobs = []
for (const p of catalog) {
  jobs.push({ key: p.handle, url: p.img, size: 620 })
  if (p.img2) jobs.push({ key: p.handle + '__2', url: p.img2, size: 620 })
}
jobs.push({ key: '__hero',  url: catalog.find(p => p.handle === 'strawberry-short-cake')?.img || catalog[0].img, size: 1000 })
jobs.push({ key: '__story', url: STORY, size: 1100 })

const out = {}
let total = 0, n = 0
for (const j of jobs) {
  try {
    const src = join(tmp, j.key.replace(/[^\w-]/g, '_') + '.png')
    const dst = src.replace(/\.png$/, '.jpg')
    const buf = execFileSync('curl', ['-sS', '-L', `${j.url}?width=${Math.round(j.size * 1.25)}`], {
      maxBuffer: 64 * 1024 * 1024, encoding: 'buffer',
    })
    writeFileSync(src, buf)
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '-Z', String(j.size), src, '--out', dst], { stdio: 'ignore' })
    const jpg = readFileSync(dst)
    out[j.key] = 'data:image/jpeg;base64,' + jpg.toString('base64')
    total += jpg.length; n++
    process.stdout.write(`  ${String(n).padStart(2)}/${jobs.length}  ${j.key.slice(0, 38).padEnd(40)} ${String(Math.round(jpg.length / 1024)).padStart(4)} KB\n`)
  } catch (e) {
    console.warn(`  !! skipped ${j.key}: ${e.message.split('\n')[0]}`)
  }
}

const dataDir = join(here, '../src/data')
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
writeFileSync(join(dataDir, 'images.json'), JSON.stringify(out))
console.log(`\n  ${n} images · ${Math.round(total / 1024)} KB raw · ${Math.round(JSON.stringify(out).length / 1024)} KB as data URIs`)
