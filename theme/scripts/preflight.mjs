/* Pre-deploy checks against the PREVIEW theme.
   Read-only: fetches rendered pages and the storefront JSON APIs. Nothing here
   writes to the store. Exit code is non-zero if any check fails, so this can gate
   a publish. */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const SHOP = 'https://dani-pro-miami.myshopify.com'
const THEME = process.env.PREVIEW_THEME_ID || '187797995830'
const UA = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) preflight' }

let pass = 0, fail = 0, warn = 0
const ok   = (m, d = '') => { pass++; console.log(`  \x1b[32mPASS\x1b[0m  ${m}${d ? '  ' + d : ''}`) }
const bad  = (m, d = '') => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? '  ' + d : ''}`) }
const note = (m, d = '') => { warn++; console.log(`  \x1b[33mWARN\x1b[0m  ${m}${d ? '  ' + d : ''}`) }
const head = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`)

/* Cookie jar. `preview_theme_id` sets a session cookie and redirects; without
   persisting it every request quietly falls back to the LIVE theme, and the whole
   suite ends up testing the wrong site while looking like it passed. */
const jar = new Map()
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ')
const absorb = (res) => {
  for (const c of (res.headers.getSetCookie?.() ?? [])) {
    const [pair] = c.split(';')
    const i = pair.indexOf('=')
    if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim())
  }
}
const url = (p) => `${SHOP}${p}${p.includes('?') ? '&' : '?'}preview_theme_id=${THEME}`
const raw = async (u, opts = {}) => {
  const res = await fetch(u, {
    ...opts,
    headers: { ...UA, ...(opts.headers || {}), ...(jar.size ? { Cookie: cookieHeader() } : {}) },
    redirect: 'manual',
  })
  absorb(res)
  if ([301, 302, 303, 307, 308].includes(res.status)) {
    const loc = new URL(res.headers.get('location'), SHOP).toString()
    return raw(loc, { ...opts, method: opts.method === 'POST' && res.status === 303 ? 'GET' : opts.method })
  }
  return res
}
const get = async (p) => {
  const r = await raw(url(p))
  return { status: r.status, html: await r.text(), final: r.url }
}
/* Prime the jar so every later request is genuinely on the preview theme. */
await raw(url('/'))
const primed = await get('/')
if (!primed.html.includes('pd-nav')) {
  console.log('\n\x1b[31mABORT\x1b[0m  preview theme did not stick; suite would be testing the live site.')
  process.exit(2)
}

/* ---------- 1. every route renders ---------- */
head('1. Routes render (200 + no Liquid error)')
const products = await raw(`${SHOP}/products.json?limit=250`).then(r => r.json())
const collections = await raw(`${SHOP}/collections.json?limit=250`).then(r => r.json())
const routes = [
  '/', '/pages/meet-your-baker', '/pages/contact', '/cart', '/search?q=cake',
  '/collections/all-products',
  ...collections.collections.slice(0, 5).map(c => `/collections/${c.handle}`),
  ...products.products.slice(0, 6).map(p => `/products/${p.handle}`),
  '/no-such-page-404',
]
const pages = {}
for (const r of routes) {
  const res = await get(r)
  pages[r] = res
  const expect404 = r.includes('no-such-page')
  const wantStatus = expect404 ? 404 : 200
  if (res.status !== wantStatus) { bad(r, `status ${res.status}, expected ${wantStatus}`); continue }
  if (/Liquid error|translation missing|<!-- .*error.*-->/i.test(res.html)) { bad(r, 'Liquid error in output'); continue }
  ok(r, `${res.status} · ${Math.round(res.html.length / 1024)}KB`)
}

/* ---------- 2. commerce still works ---------- */
head('2. Commerce paths')
const firstVariant = products.products[0]?.variants?.[0]?.id
if (!firstVariant) bad('no variant found to test'); else {
  /* Shopify redirects the cart AJAX endpoints to an HTML page unless the request
     looks like XHR, which is why a bare fetch here comes back as a document. */
  const AJAX = { 'Content-Type': 'application/json', 'Accept': 'application/json',
                 'X-Requested-With': 'XMLHttpRequest' }
  const asJson = async (res) => {
    const t = await res.text()
    try { return JSON.parse(t) } catch { return { __notJson: t.slice(0, 60) } }
  }
  const add = await raw(`${SHOP}/cart/add.js`, {
    method: 'POST', headers: AJAX,
    body: JSON.stringify({ items: [{ id: firstVariant, quantity: 1 }] }),
  })
  const added = await asJson(add)
  const cart = await asJson(await raw(`${SHOP}/cart.js`, { headers: AJAX }))
  if (cart.__notJson) bad('add to cart', `cart.js returned HTML: ${cart.__notJson}`)
  else if (add.ok && cart.item_count > 0) ok('add to cart', `HTTP ${add.status} · ${added.items?.[0]?.title || ''}`)
  else bad('add to cart', `HTTP ${add.status} · cart count ${cart.item_count}`)
  /* clear.js responds with the emptied cart, so read the count from it directly. */
  const cleared = await asJson(await raw(`${SHOP}/cart/clear.js`, { method: 'POST', headers: AJAX }))
  cleared.item_count === 0 ? ok('cart cleared after test') : bad('cart not cleared', `${cleared.item_count} left`)
}
const cartPage = pages['/cart']
cartPage?.html.includes('/checkout') ? ok('checkout route present on /cart') : note('no /checkout link found on /cart')

/* ---------- 3. our sections actually rendered ---------- */
head('3. Sections present on the homepage')
const home = pages['/'].html
for (const [name, marker] of [
  ['header',      'pd-nav'],
  ['hero',        'pd-hero'],
  ['badges',      'pd-badges'],
  ['collection',  'pd-collection'],
  ['chocolate band', 'pd-shout'],
  ['stat deck',   'pd-stack'],
  ['meet your baker', 'pd-story'],
  ['bleed word',  'pd-bleed'],
  ['reviews',     'pd-reviews'],
  ['contact',     'pd-contact'],
  ['footer',      'pd-foot'],
]) home.includes(marker) ? ok(name) : bad(name, `"${marker}" missing`)

/* ---------- 4. no stock Dawn leaking through ---------- */
head('4. No stock Dawn remnants')
for (const [what, marker] of [
  ['Dawn header',    'header-wrapper'],
  ['Dawn footer',    'footer__content-top'],
  ['onboarding text','Example product title'],
]) home.includes(marker) ? bad(what, 'still rendering') : ok(`${what} replaced`)

/* ---------- 5. assets referenced actually exist ---------- */
head('5. Referenced theme assets resolve')
/* Shopify emits protocol-relative asset URLs, so anchoring on https:// matches
   nothing and the whole section silently passes with zero checks. */
const assetUrls = [...new Set([...home.matchAll(/(?:https:)?\/\/[^"')\s]*\/cdn\/shop\/t\/\d+\/assets\/[^"')\s]+/g)]
  .map(m => m[0].startsWith('//') ? 'https:' + m[0] : m[0]))]
if (!assetUrls.length) bad('no theme assets found in the page (regex likely wrong)')
for (const a of assetUrls.slice(0, 24)) {
  const r = await raw(a, { method: 'HEAD' })
  const name = a.split('/').pop().split('?')[0]
  r.ok ? ok(name, r.status) : bad(name, `HTTP ${r.status}`)
}

/* ---------- 6. accessibility invariants ---------- */
head('6. Accessibility invariants')
for (const [route, res] of Object.entries(pages)) {
  if (res.status !== 200) continue
  const h1 = (res.html.match(/<h1[\s>]/g) || []).length
  if (h1 === 1) ok(`${route} has exactly one <h1>`)
  else if (h1 === 0) note(`${route} has no <h1>`)
  else bad(`${route} has ${h1} <h1> tags`)
}
const imgs = [...home.matchAll(/<img\b[^>]*>/g)].map(m => m[0])
const noAlt = imgs.filter(t => !/\balt\s*=/.test(t))
noAlt.length === 0 ? ok(`all ${imgs.length} homepage <img> have alt`) : bad(`${noAlt.length}/${imgs.length} <img> missing alt`)
const noDim = imgs.filter(t => !(/\bwidth\s*=/.test(t) && /\bheight\s*=/.test(t)))
noDim.length === 0 ? ok('all homepage images declare width+height (CLS)') : note(`${noDim.length}/${imgs.length} images lack width/height`)

/* ---------- 7. copy hygiene ---------- */
head('7. Copy hygiene')
/* Strip the Judge.me widget before the copy audit: those are verbatim customer
   reviews. Rewriting a testimonial to satisfy a house style rule would falsify it,
   so they are excluded rather than flagged. */
const ourCopy = home
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<div[^>]*id=["']judgeme_all_reviews_page["'][\s\S]*?<\/details>/g, '')
  .replace(/<blockquote[\s\S]*?<\/blockquote>/g, '')
  .replace(/<[^>]+>/g, ' ')
const visible = ourCopy
const emDash = (visible.match(/—/g) || []).length
emDash === 0 ? ok('em-dashes in our own copy: 0') : bad(`em-dashes in our own copy: ${emDash}`)
for (const t of ['more then', 'caterings', 'flavours', 'Lorem ipsum', 'undefined', 'NaN', 'null']) {
  visible.includes(t) ? bad(`stray "${t}" in copy`) : ok(`no "${t}"`)
}

/* ---------- 8. live theme untouched ---------- */
head('8. Live theme untouched')
const token = readFileSync(join(here, '../.env'), 'utf8').match(/PRODANI_PASSWORD=(\S+)/)?.[1]
const themes = await fetch('https://theme-kit-access.shopifyapps.com/cli/admin/api/2024-10/themes.json', {
  headers: { 'X-Shopify-Shop': 'dani-pro-miami.myshopify.com', 'X-Shopify-Access-Token': token },
}).then(r => r.json())
const live = themes.themes.find(t => t.role === 'main')
live.id === 154419691830 ? ok('live theme is still Prodani - v.0.0.1', `updated ${live.updated_at.slice(0, 10)}`)
                         : bad('LIVE THEME CHANGED', live.name)
const preview = themes.themes.find(t => String(t.id) === THEME)
preview?.role === 'unpublished' ? ok('preview theme is unpublished') : bad('preview theme role', preview?.role)

/* ---------- summary ---------- */
console.log(`\n\x1b[1m${pass} passed · ${fail} failed · ${warn} warnings\x1b[0m`)
process.exit(fail > 0 ? 1 : 0)
