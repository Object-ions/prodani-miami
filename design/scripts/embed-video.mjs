/* Fetches the storefront's hero video, re-encodes it for web, and writes
   src/data/video.json as { mp4, poster } data URIs for the single-file build.

   The source on the live site is 5.5 MB: 1280x720, 3.1 Mbps, with an audio
   track that a muted background loop never plays. Stripping the audio and
   encoding at CRF 27 / 24fps gets it to ~440 KB with no visible difference.

   Degrades gracefully: if ffmpeg is missing or the fetch fails, it writes an
   empty map and the app falls back to the CDN URL. */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = join(here, '../src/data')
const out = join(dataDir, 'video.json')
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })

const SRC = 'https://cdn.shopify.com/videos/c/o/v/5cb3aeadf0864053899148b99e96d5ff.mp4'

const has = (bin) => {
  try { execFileSync('which', [bin], { stdio: 'ignore' }); return true } catch { return false }
}

if (!has('ffmpeg')) {
  console.warn('  !! ffmpeg not found — writing empty video.json, app will stream from the CDN')
  writeFileSync(out, '{}')
  process.exit(0)
}

try {
  const tmp = mkdtempSync(join(tmpdir(), 'pd-vid-'))
  const orig = join(tmp, 'orig.mp4')
  const mp4 = join(tmp, 'hero.mp4')
  const png = join(tmp, 'poster.png')
  const jpg = join(tmp, 'poster.jpg')

  execFileSync('curl', ['-sS', '-L', SRC, '-o', orig], { stdio: 'ignore' })
  const before = readFileSync(orig).length

  execFileSync('ffmpeg', [
    '-y', '-v', 'error', '-i', orig,
    '-an',                          // muted background loop — audio is dead weight
    '-r', '24',
    '-vf', 'scale=1280:-2',
    '-c:v', 'libx264', '-crf', '27', '-preset', 'slow',
    '-profile:v', 'main', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    mp4,
  ], { stdio: 'ignore' })

  execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', '1.5', '-i', orig,
    '-frames:v', '1', '-vf', 'scale=1280:-2', png], { stdio: 'ignore' })
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '68',
    '-Z', '1280', png, '--out', jpg], { stdio: 'ignore' })

  const vBuf = readFileSync(mp4)
  const pBuf = readFileSync(jpg)
  writeFileSync(out, JSON.stringify({
    mp4: 'data:video/mp4;base64,' + vBuf.toString('base64'),
    poster: 'data:image/jpeg;base64,' + pBuf.toString('base64'),
  }))

  const kb = (n) => Math.round(n / 1024) + ' KB'
  console.log(`  hero video  ${kb(before)} -> ${kb(vBuf.length)}  (${Math.round((1 - vBuf.length / before) * 100)}% smaller)`)
  console.log(`  poster      ${kb(pBuf.length)}`)
} catch (e) {
  console.warn('  !! video encode failed, falling back to CDN:', e.message.split('\n')[0])
  writeFileSync(out, '{}')
}
