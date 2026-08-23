/* Builds the side-by-side comparison images.

   There is no image library on this machine, so the compositing is done by
   laying the two screenshots out in HTML and screenshotting the result at an
   exact size — the same headless Chrome the measurements ran through. Slower
   than a real compositor, but it means the labels are set in the same typeface
   as the case study rather than drawn by hand.  */
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const IMG = join(here, 'images')
const FONT = join(here, '../theme/prodani/assets/fugaz-one-latin.woff2')
mkdirSync(join(IMG, 'pairs'), { recursive: true })

const b64 = (p, m) => `data:${m};base64,` + readFileSync(p).toString('base64')
const fugaz = b64(FONT, 'font/woff2')

const PAGES = [
  ['home',    'Homepage'],
  ['product', 'Product page'],
  ['baker',   'Meet Your Baker'],
  ['contact', 'Contact'],
]

/* 1150 + 24 gutter + 1150, plus a 76px caption strip. */
const W = 2324, H = 1076
const pairHtml = (key, title) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Fugaz One";src:url(${fugaz}) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;background:#F4F4F1;font-family:ui-sans-serif,-apple-system,"Helvetica Neue",sans-serif;
     display:grid;grid-template-rows:auto 1fr;gap:14px;padding:18px 0 0}
.head{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding-inline:0}
.lab{display:flex;align-items:baseline;gap:14px}
.tag{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:15px;letter-spacing:.14em;
     text-transform:uppercase;padding:5px 12px;border-radius:2px;background:#16171B;color:#fff}
.tag--now{background:#C13C68}
.ttl{font-family:"Fugaz One";font-size:30px;color:#16171B;letter-spacing:-.01em}
.sub{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:14px;color:#84868D;margin-left:auto}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.shot{width:1150px;height:966px;overflow:hidden;border:1px solid #DCDCD7;background:#fff}
.shot img{display:block;width:1150px}
</style></head><body>
  <div class="head">
    <div class="lab"><span class="tag">Before</span><span class="ttl">${title}</span></div>
    <div class="lab"><span class="tag tag--now">After</span><span class="ttl">${title}</span>
      <span class="sub">prodanimiami.com &middot; 1150px</span></div>
  </div>
  <div class="pair">
    <div class="shot"><img src="${b64(join(IMG, 'before', key + '-1150.jpg'), 'image/jpeg')}"></div>
    <div class="shot"><img src="${b64(join(IMG, 'after',  key + '-1150.jpg'), 'image/jpeg')}"></div>
  </div>
</body></html>`

/* ---- CDP ---- */
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9521
const sleep = ms => new Promise(r => setTimeout(r, ms))
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/pd-compose', '--no-first-run', '--hide-scrollbars',
  '--force-device-scale-factor=1', 'about:blank'], { stdio: 'ignore' })
let ver
for (let i = 0; i < 120; i++) {
  try { ver = await fetch(`http://127.0.0.1:${PORT}/json/version`).then(r => r.json()); break }
  catch { await sleep(300) }
}
if (!ver) { chrome.kill(); throw new Error('chrome never came up') }
const ws = new WebSocket(ver.webSocketDebuggerUrl); await new Promise(r => (ws.onopen = r))
let id = 0; const q = new Map()
ws.onmessage = m => { const x = JSON.parse(m.data)
  if (x.id && q.has(x.id)) { const { res, rej } = q.get(x.id); q.delete(x.id)
    x.error ? rej(new Error(x.error.message)) : res(x.result) } }
const send = (m, p = {}, s) => new Promise((res, rej) => {
  const i = ++id; q.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p, ...(s ? { sessionId: s } : {}) })) })
/* Each frame gets its own target, and the markup goes through a temp file rather
   than a data: URL. Two 1150px JPEGs base64'd into a navigation URL is roughly
   300KB of address, and the renderer dies partway through the set. */
let seq = 0
const render = async (html, w, h, out) => {
  const tmp = join(tmpdir(), `pd-compose-${++seq}.html`)
  writeFileSync(tmp, html)
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  await send('Page.enable', {}, sessionId)
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false }, sessionId)
  await send('Page.navigate', { url: 'file://' + tmp }, sessionId)
  await sleep(2400)
  const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 }, sessionId)
  writeFileSync(out, Buffer.from(data, 'base64'))
  await send('Target.closeTarget', { targetId })
  rmSync(tmp, { force: true })
  console.log('  ', out.replace(here + '/', ''), `${w}x${h}`)
}

for (const [key, title] of PAGES) {
  await render(pairHtml(key, title), W, H, join(IMG, 'pairs', `${key}.jpg`))
}

/* Cover, at the 1.91:1 ratio link previews crop to. The homepage pair is the
   clearest single frame of what changed. */
const cover = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Fugaz One";src:url(${fugaz}) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#F4F4F1;font-family:ui-sans-serif,-apple-system,sans-serif;
     display:grid;grid-template-rows:auto 1fr;overflow:hidden}
.bar{padding:26px 34px 18px;display:flex;align-items:baseline;gap:16px}
h1{font-family:"Fugaz One";font-size:40px;color:#16171B;letter-spacing:-.015em;font-weight:400}
h1 em{font-style:normal;color:#C13C68}
.meta{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:13px;letter-spacing:.12em;
      text-transform:uppercase;color:#84868D;margin-left:auto}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 34px 34px}
.shot{position:relative;overflow:hidden;border:1px solid #DCDCD7;background:#fff}
.shot img{display:block;width:100%}
/* Bottom-left, not top-left: the top of both frames is the site header, and a
   label sitting on the logo is the first thing a reader would notice. */
.tag{position:absolute;bottom:10px;left:10px;font-family:ui-monospace,Menlo,monospace;font-size:11px;
     letter-spacing:.14em;text-transform:uppercase;padding:4px 10px;border-radius:2px;
     background:rgba(10,10,12,.78);color:#fff}
.tag--now{background:#C13C68}
</style></head><body>
  <div class="bar"><h1>ProDani Miami, <em>rebuilt</em></h1>
    <span class="meta">&minus;74% page weight &middot; &minus;54% LCP</span></div>
  <div class="pair">
    <div class="shot"><span class="tag">Before</span><img src="${b64(join(IMG, 'before', 'home-1150.jpg'), 'image/jpeg')}"></div>
    <div class="shot"><span class="tag tag--now">After</span><img src="${b64(join(IMG, 'after', 'home-1150.jpg'), 'image/jpeg')}"></div>
  </div>
</body></html>`
await render(cover, 1200, 630, join(IMG, 'cover-1200x630.jpg'))

ws.close(); chrome.kill(); process.exit(0)
