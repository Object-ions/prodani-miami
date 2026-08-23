/* Before/after capture rig.
   Drives a headless Chrome over CDP rather than the visible browser, because the
   viewport has to be EXACTLY 1150px wide for both runs — a case study comparing
   two designs at two different widths measures nothing. Emulation.setDeviceMetricsOverride
   pins it; window resizing does not (the tab's renderer reports a fixed innerWidth).

   Read-only against the storefront: it navigates and measures, nothing else. */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9333
const WIDTH = 1150
const HEIGHT = 1000
const OUT = process.env.OUT_DIR || '/tmp/prodani-casestudy'
const RUNS = 5
mkdirSync(OUT, { recursive: true })

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/* ---------- launch ---------- */
const profile = join(OUT, `.profile-${process.pid}`)
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  `--window-size=${WIDTH},${HEIGHT}`,
  '--hide-scrollbars',
  '--no-first-run', '--no-default-browser-check',
  '--disable-features=Translate,MediaRouter',
  '--force-device-scale-factor=1',
  'about:blank',
], { stdio: 'ignore' })

let version
for (let i = 0; i < 60; i++) {
  try { version = await fetch(`http://127.0.0.1:${PORT}/json/version`).then(r => r.json()); break }
  catch { await sleep(250) }
}
if (!version) { chrome.kill(); throw new Error('chrome never came up') }

/* ---------- minimal CDP client ---------- */
const ws = new WebSocket(version.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
let seq = 0
const waiting = new Map()
const listeners = []
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data)
  if (msg.id && waiting.has(msg.id)) {
    const { res, rej } = waiting.get(msg.id); waiting.delete(msg.id)
    msg.error ? rej(new Error(msg.error.message)) : res(msg.result)
  } else if (msg.method) {
    for (const l of [...listeners]) l(msg)
  }
}
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = ++seq
  waiting.set(id, { res, rej })
  ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
})
const once = (method, sessionId, timeout = 45000) => new Promise((res, rej) => {
  const t = setTimeout(() => { off(); rej(new Error(`timeout waiting for ${method}`)) }, timeout)
  const l = (msg) => {
    if (msg.method === method && (!sessionId || msg.sessionId === sessionId)) { off(); clearTimeout(t); res(msg.params) }
  }
  const off = () => listeners.splice(listeners.indexOf(l), 1)
  listeners.push(l)
})

/* Registered before every document so the observers exist before the first paint;
   layout-shift and long-task entries are not retrievable after the fact. */
const PROBE = `
window.__cls = 0; window.__shifts = 0; window.__longTasks = 0; window.__longTaskMs = 0;
try {
  new PerformanceObserver((l) => { for (const e of l.getEntries())
    if (!e.hadRecentInput) { window.__cls += e.value; window.__shifts++ }
  }).observe({ type: 'layout-shift', buffered: true });
} catch {}
try {
  new PerformanceObserver((l) => { for (const e of l.getEntries())
    { window.__longTasks++; window.__longTaskMs += e.duration }
  }).observe({ type: 'longtask', buffered: true });
} catch {}
/* LCP entries are delivered to observers only; they are never added to the main
   performance timeline, so getEntriesByType('largest-contentful-paint') is []. */
window.__lcp = null; window.__lcpEl = null;
try {
  new PerformanceObserver((l) => { const e = l.getEntries().pop();
    if (e) { window.__lcp = e.startTime;
             window.__lcpEl = (e.element && (e.element.tagName + (e.element.className ? '.' + String(e.element.className).split(' ')[0] : ''))) || e.url || null }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
} catch {}
`

const COLLECT = `(() => {
  const nav = performance.getEntriesByType('navigation')[0] || {};
  const res = performance.getEntriesByType('resource');
  const paint = Object.fromEntries(performance.getEntriesByType('paint').map(p => [p.name, p.startTime]));
  const lcp = window.__lcp;
  const kind = (r) => {
    const t = r.initiatorType, u = r.name.split('?')[0].toLowerCase();
    if (t === 'css' || u.endsWith('.css')) return 'css';
    if (t === 'script' || u.endsWith('.js')) return 'js';
    if (t === 'img' || /\\.(png|jpe?g|gif|webp|avif|svg|ico)$/.test(u)) return 'img';
    if (/\\.(woff2?|ttf|otf|eot)$/.test(u)) return 'font';
    if (/\\.(mp4|webm|mov|m4v)$/.test(u)) return 'media';
    if (t === 'xmlhttprequest' || t === 'fetch') return 'xhr';
    return 'other';
  };
  const by = {};
  let transfer = nav.transferSize || 0, decoded = nav.decodedBodySize || 0;
  for (const r of res) {
    const k = kind(r);
    by[k] = by[k] || { count: 0, transfer: 0 };
    by[k].count++; by[k].transfer += r.transferSize || 0;
    transfer += r.transferSize || 0; decoded += r.decodedBodySize || 0;
  }
  const thirdParty = res.filter(r => { try { return new URL(r.name).hostname !== location.hostname } catch { return false } });
  return {
    ttfb: nav.responseStart, domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd,
    domInteractive: nav.domInteractive,
    fcp: paint['first-contentful-paint'] ?? null, lcp,
    lcpElement: window.__lcpEl,
    cls: window.__cls, shifts: window.__shifts,
    longTasks: window.__longTasks, longTaskMs: window.__longTaskMs,
    requests: res.length + 1, transfer, decoded, by,
    thirdPartyRequests: thirdParty.length,
    thirdPartyTransfer: thirdParty.reduce((a, r) => a + (r.transferSize || 0), 0),
    thirdPartyHosts: [...new Set(thirdParty.map(r => { try { return new URL(r.name).hostname } catch { return '?' } }))].sort(),
    domNodes: document.getElementsByTagName('*').length,
    domDepth: (function d(n, x) { let m = x; for (const c of n.children) m = Math.max(m, d(c, x + 1)); return m })(document.body, 0),
    stylesheets: document.styleSheets.length,
    scripts: document.scripts.length,
    images: document.images.length,
    slowest: res.map(r => ({ n: r.name.split('?')[0].split('/').slice(2).join('/').slice(-58), ms: Math.round(r.duration), kb: Math.round((r.transferSize||0)/1024) }))
      .sort((a, b) => b.ms - a.ms).slice(0, 8),
    heaviest: res.map(r => ({ n: r.name.split('?')[0].split('/').slice(2).join('/').slice(-58), kb: Math.round((r.transferSize||0)/1024) }))
      .sort((a, b) => b.kb - a.kb).slice(0, 8),
    scrollHeight: document.documentElement.scrollHeight,
    title: document.title,
    marker: document.documentElement.innerHTML.includes('pd-nav') ? 'new' : 'old',
  };
})()`

async function newPage() {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  await send('Page.enable', {}, sessionId)
  await send('Network.enable', {}, sessionId)
  await send('Emulation.setDeviceMetricsOverride',
    { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false }, sessionId)
  await send('Page.addScriptToEvaluateOnNewDocument', { source: PROBE }, sessionId)
  return { targetId, sessionId }
}

async function load(sessionId, url, { cold = true, settle = 6000 } = {}) {
  await send('Network.setCacheDisabled', { cacheDisabled: cold }, sessionId)
  const loaded = once('Page.loadEventFired', sessionId)
  await send('Page.navigate', { url }, sessionId)
  await loaded
  await sleep(settle)
  const { result } = await send('Runtime.evaluate',
    { expression: COLLECT, returnByValue: true, awaitPromise: false }, sessionId)
  return result.value
}

async function shoot(sessionId, file, { full = false } = {}) {
  /* Shopify injects its preview bar into the previewed theme only. Leaving it in
     would put a control strip across the bottom of every AFTER shot and none of
     the BEFORE ones — a difference the reader would read as design. */
  await send('Runtime.evaluate', { expression:
    `document.querySelectorAll('#PBarNextFrameWrapper,#PBarNextFrame').forEach(e => e.remove())`,
    returnByValue: true }, sessionId)
  await sleep(400)
  let clip
  if (full) {
    const { result } = await send('Runtime.evaluate',
      { expression: 'document.documentElement.scrollHeight', returnByValue: true }, sessionId)
    clip = { x: 0, y: 0, width: WIDTH, height: Math.min(result.value, 24000), scale: 1 }
  }
  const { data } = await send('Page.captureScreenshot',
    { format: 'jpeg', quality: 88, captureBeyondViewport: full, ...(clip ? { clip } : {}) }, sessionId)
  writeFileSync(join(OUT, file), Buffer.from(data, 'base64'))
  return join(OUT, file)
}

const median = (xs) => { const s = [...xs].filter(n => typeof n === 'number' && isFinite(n)).sort((a, b) => a - b)
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null }

/* ---------- the two variants ---------- */
const VARIANTS = [
  { key: 'before', label: 'Live theme (Minimog 3.5.0)', prime: null },
  { key: 'after',  label: 'New theme (prodani, Dawn 16 base)', prime: 'https://prodanimiami.com/?preview_theme_id=187797995830&pb=0' },
]
/* pb=0 suppresses Shopify's preview bar, which is injected into the previewed
   theme only. It goes on BOTH variants so the measured URLs stay identical in
   shape — the live theme simply has no bar to suppress. */
const PATHS = [
  { key: 'home',    url: 'https://prodanimiami.com/?pb=0' },
  { key: 'product', url: 'https://prodanimiami.com/products/family-orange-cake?pb=0' },
  { key: 'baker',   url: 'https://prodanimiami.com/pages/meet-your-baker?pb=0' },
  { key: 'contact', url: 'https://prodanimiami.com/pages/contact?pb=0' },
]

/* Runs are INTERLEAVED (run 1 before, run 1 after, run 2 before, ...) rather than
   all-before-then-all-after. The store is on the live internet: a slow minute would
   otherwise land entirely on one variant and read as a design regression. */
const bucket = {}
for (const v of VARIANTS) for (const p of PATHS) bucket[`${v.key}/${p.key}`] = []
for (let i = 0; i < RUNS; i++) {
  for (const v of VARIANTS) {
    for (const p of PATHS) {
      const { targetId, sessionId } = await newPage()
      /* The profile is shared across targets, so the preview cookie persists —
         it is set or cleared explicitly on every run. */
      if (v.prime) await load(sessionId, v.prime, { settle: 1500 })
      else await load(sessionId, 'https://prodanimiami.com/?preview_theme_id=&pb=0', { settle: 1500 })
      const m = await load(sessionId, p.url)
      bucket[`${v.key}/${p.key}`].push(m)
      if (i === 0) {
        m.viewportShot = await shoot(sessionId, `${v.key}-${p.key}-viewport.jpg`)
        m.fullShot = await shoot(sessionId, `${v.key}-${p.key}-full.jpg`, { full: true })
      }
      await send('Target.closeTarget', { targetId })
    }
  }
  console.log(`  run ${i + 1}/${RUNS} done`)
}

const report = {}
for (const v of VARIANTS) {
  report[v.key] = { label: v.label, pages: {} }
  for (const p of PATHS) {
    const runs = bucket[`${v.key}/${p.key}`]
    const first = runs[0]
    if (v.key === 'before' && first.marker !== 'old') throw new Error('BEFORE run picked up the new theme')
    if (v.key === 'after'  && first.marker !== 'new') throw new Error('AFTER run did not get the preview theme')
    report[v.key].pages[p.key] = {
      url: p.url,
      median: Object.fromEntries(['ttfb','fcp','lcp','domContentLoaded','load','cls','longTasks','longTaskMs','requests','transfer','decoded','domNodes','domDepth','scrollHeight','thirdPartyRequests','thirdPartyTransfer']
        .map(k => [k, median(runs.map(r => r[k]))])),
      static: {
        by: first.by, stylesheets: first.stylesheets, scripts: first.scripts, images: first.images,
        thirdPartyHosts: first.thirdPartyHosts, title: first.title, marker: first.marker,
        lcpElement: first.lcpElement, slowest: first.slowest, heaviest: first.heaviest,
      },
      shots: { viewport: first.viewportShot, full: first.fullShot },
      runs: runs.map(r => ({ lcp: r.lcp, load: r.load, cls: r.cls, transfer: r.transfer })),
    }
    console.log(`${v.key}/${p.key}  lcp ${Math.round(median(runs.map(r=>r.lcp)))}ms  load ${Math.round(median(runs.map(r=>r.load)))}ms  cls ${median(runs.map(r=>r.cls)).toFixed(4)}  ${median(runs.map(r=>r.requests))} req  ${(median(runs.map(r=>r.transfer))/1024/1024).toFixed(2)}MB  ${median(runs.map(r=>r.domNodes))} nodes`)
  }
}

writeFileSync(join(OUT, 'metrics.json'), JSON.stringify(report, null, 2))
console.log(`\nwrote ${join(OUT, 'metrics.json')}`)
ws.close(); chrome.kill()
process.exit(0)
