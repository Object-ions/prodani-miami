/* Publishes a theme, and writes down how to undo it.

   Publishing swaps which theme the storefront renders. It does not touch
   products, orders, customers or checkout — those live in the store's data, not
   in the theme. The theme being replaced is demoted to `unpublished` and stays
   in the library, so a rollback is one API call back the other way.

   Refuses to run without --yes, and refuses to publish a theme that is already
   main or that it cannot find. */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const SHOP = 'dani-pro-miami.myshopify.com'
const TOKEN = readFileSync(join(here, '../.env'), 'utf8').match(/PRODANI_PASSWORD=(\S+)/)?.[1]
if (!TOKEN) { console.error('no PRODANI_PASSWORD in theme/.env'); process.exit(2) }

/* Theme Access tokens authenticate through this proxy, NOT <shop>/admin —
   the direct admin host returns 401 for a perfectly valid token. */
const api = (path, opts = {}) =>
  fetch(`https://theme-kit-access.shopifyapps.com/cli/admin/api/2024-10/${path}`, {
    ...opts,
    headers: { 'X-Shopify-Shop': SHOP, 'X-Shopify-Access-Token': TOKEN,
               'Content-Type': 'application/json', ...(opts.headers || {}) },
  })

const target = process.argv[2]
const confirmed = process.argv.includes('--yes')
if (!target) { console.error('usage: node scripts/publish.mjs <theme_id> --yes'); process.exit(2) }

const { themes } = await api('themes.json').then(r => r.json())
const next = themes.find(t => String(t.id) === String(target))
const live = themes.find(t => t.role === 'main')

if (!next) { console.error(`theme ${target} not found in this store`); process.exit(2) }
if (next.role === 'main') { console.error(`theme ${target} is already live`); process.exit(2) }

console.log(`  live now : ${live.id}  ${live.name}  (updated ${live.updated_at.slice(0, 10)})`)
console.log(`  publishing: ${next.id}  ${next.name}  (updated ${next.updated_at.slice(0, 10)})`)

if (!confirmed) { console.log('\n  dry run — pass --yes to publish'); process.exit(0) }

/* Written BEFORE the swap, so the undo instruction survives even if the
   request fails halfway or the process dies. */
const rollback = {
  publishedAt: new Date().toISOString(),
  publishedThemeId: next.id, publishedThemeName: next.name,
  rollbackToId: live.id, rollbackToName: live.name, rollbackToUpdatedAt: live.updated_at,
  command: `node scripts/publish.mjs ${live.id} --yes`,
}
writeFileSync(join(here, '../ROLLBACK.json'), JSON.stringify(rollback, null, 2))

const res = await api(`themes/${next.id}.json`, {
  method: 'PUT',
  body: JSON.stringify({ theme: { id: next.id, role: 'main' } }),
})
const body = await res.text()
if (!res.ok) { console.error(`\n  FAILED  HTTP ${res.status}\n${body.slice(0, 500)}`); process.exit(1) }

const after = await api('themes.json').then(r => r.json())
const nowLive = after.themes.find(t => t.role === 'main')
const demoted = after.themes.find(t => String(t.id) === String(live.id))

console.log(`\n  live is now : ${nowLive.id}  ${nowLive.name}`)
console.log(`  previous theme: ${demoted.id}  ${demoted.name}  role=${demoted.role}`)
console.log(`  rollback      : ${rollback.command}`)

if (String(nowLive.id) !== String(next.id)) { console.error('\n  the swap did not take'); process.exit(1) }
if (demoted.role !== 'unpublished') { console.error('\n  previous theme is not recoverable — check the admin'); process.exit(1) }
console.log('\n  done. previous theme kept in the library.')
