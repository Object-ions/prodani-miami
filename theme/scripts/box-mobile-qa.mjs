/* Mobile QA for the box builder, at a real phone viewport.

   The visible-Chrome tab cannot be resized, so phone layout is checked with a
   headless Chrome + CDP and Emulation.setDeviceMetricsOverride (390x844, mobile:true,
   iPhone UA) — the same rig shape as casestudy.mjs.

   Waits on Page.domContentEventFired, NOT loadEventFired: the storefront's
   third-party scripts can delay `load` past any sane timeout.

   Read-only: it navigates, clicks inside the builder, and measures. It never adds
   to cart (the flavors are draft products, so add-to-cart is in preview mode anyway).

   Usage: node scripts/box-mobile-qa.mjs [url] */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9344
const WIDTH = 390
const HEIGHT = 844
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const URL = process.argv[2] || 'https://prodanimiami.com/?preview_theme_id=187797799222'
const OUT = process.env.OUT_DIR || '/tmp/prodani-box-mobile'
mkdirSync(OUT, { recursive: true })

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const profile = join(OUT, `.profile-${process.pid}`)
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  `--window-size=${WIDTH},${HEIGHT}`,
  '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  '--disable-features=Translate,MediaRouter', '--force-device-scale-factor=1',
  'about:blank',
], { stdio: 'ignore' })

let version
for (let i = 0; i < 60; i++) {
  try { version = await fetch(`http://127.0.0.1:${PORT}/json/version`).then(r => r.json()); break }
  catch { await sleep(250) }
}
if (!version) { chrome.kill(); throw new Error('chrome never came up') }

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
  } else if (msg.method) { for (const l of [...listeners]) l(msg) }
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

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Page.enable', {}, sessionId)
await send('Emulation.setDeviceMetricsOverride',
  { width: WIDTH, height: HEIGHT, deviceScaleFactor: 3, mobile: true, hasTouch: true }, sessionId)
await send('Emulation.setUserAgentOverride', { userAgent: UA }, sessionId)

const dom = once('Page.domContentEventFired', sessionId)
await send('Page.navigate', { url: URL }, sessionId)
await dom
await sleep(7000)

const evaluate = async (expression) => {
  const { result, exceptionDetails } = await send('Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: false }, sessionId)
  if (exceptionDetails) throw new Error(exceptionDetails.text + ' :: ' + (exceptionDetails.exception?.description || ''))
  return result.value
}

await evaluate(`document.querySelectorAll('#PBarNextFrameWrapper,#PBarNextFrame').forEach(e => e.remove())`)

const MEASURE = `(() => {
  const box = document.querySelector('[data-pd-box]');
  if (!box) return { error: 'box builder not found' };
  const r = (el) => { const b = el.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.left) }; };
  const modes = [...box.querySelectorAll('[data-pd-mode]')];
  const cards = [...box.querySelectorAll('[data-pd-curated]')];
  const sizes = [...box.querySelectorAll('.pd-box__size')];
  const subOpts = [...box.querySelectorAll('.pd-sub__opt')];
  const cta = box.querySelector('.pd-box__cta');
  return {
    docWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    modes: modes.map(r),
    modesSameRow: modes.length === 2 ? Math.abs(modes[0].getBoundingClientRect().top - modes[1].getBoundingClientRect().top) < 2 : null,
    curatedCards: cards.map(r),
    curatedSingleColumn: cards.length < 2 ? null : Math.abs(cards[0].getBoundingClientRect().left - cards[1].getBoundingClientRect().left) < 2,
    sizes: sizes.map(r),
    subOptions: subOpts.map(r),
    ctaSticky: cta ? getComputedStyle(cta).position : null,
    tapTargetsUnder44: [...box.querySelectorAll('button, select, input')]
      .filter(el => el.offsetParent !== null)
      .map(el => ({ el: (el.dataset.pdMode || el.className || el.tagName), h: Math.round(el.getBoundingClientRect().height) }))
      .filter(t => t.h > 0 && t.h < 44),
  };
})()`

const before = await evaluate(MEASURE)

// Exercise the curated flow at phone width.
const interact = await evaluate(`(() => {
  const box = document.querySelector('[data-pd-box]');
  const tabs = [...box.querySelectorAll('[data-pd-mode]')];
  const out = {};
  if (tabs[1]) {
    tabs[1].click();
    out.curatedPanelVisible = !box.querySelector('[data-pd-panel="curated"]').hidden;
  }
  const card = box.querySelector('[data-pd-curated]');
  if (card) {
    card.click();
    out.afterCurated = {
      counter: box.querySelector('[data-pd-selected]').textContent + '/' + box.querySelector('[data-pd-total]').textContent,
      add: box.querySelector('[data-pd-add]').textContent.trim(),
      disabled: box.querySelector('[data-pd-add]').disabled,
      note: box.querySelector('[data-pd-note]').textContent,
    };
  }
  out.overflowAfter = document.documentElement.scrollWidth > window.innerWidth + 1;
  return out;
})()`)

await send('Runtime.evaluate', { expression: `window.scrollTo(0, document.querySelector('[data-pd-box]').offsetTop - 10)` }, sessionId)
await sleep(600)
const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId)
writeFileSync(join(OUT, 'box-mobile.png'), Buffer.from(shot.data, 'base64'))

const report = { url: URL, viewport: `${WIDTH}x${HEIGHT}`, before, interact }
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
console.log('\nscreenshot:', join(OUT, 'box-mobile.png'))

ws.close(); chrome.kill()
