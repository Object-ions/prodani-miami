# ProDani Miami — redesign concept

A whimsical storefront concept, built as a React app, using **ProDani's own brand
system** — the chocolate / pink / cream palette and the real Konnect, Damion and
Fugaz One type stack lifted from the live site.

An earlier pass took its direction from [davidprotein.com](https://davidprotein.com)
and landed too austere for the brand. This version keeps the structural discipline
but swaps the mood: soft corners, bouncy spring motion, scalloped edges, oversized
pink type, script headings.

Runs on the **real catalog**: 27 products pulled from `products.json`, real prices,
real photography, real Judge.me review copy.

## Run it

```bash
cd design            # the app lives here — there is no package.json at the repo root
npm install
npm run dev          # http://localhost:5183 (opens automatically)
```

That's it. `npm install` bootstraps the two generated files automatically
(via `postinstall`), so there's no separate setup step — fonts and product
photos load over the network from Google Fonts and the Shopify CDN.

The port is pinned to **5183** with `strictPort`, not Vite's default 5173.
Vite silently falls forward to 5174, 5175 and so on when its port is taken,
which makes it easy to open a different app and think this one is broken.
Pinning means a clash fails loudly instead.

### Scripts

| | |
|---|---|
| `npm run dev` | dev server with hot reload |
| `npm run build` | production build to `dist/` (~320 KB, remote assets) |
| `npm run setup` | download and inline every font + photo as base64 |
| `npm run build:single` | runs setup, then emits one self-contained `dist/index.html` (~6.9 MB, zero network requests) |
| `npm run preview` | serve the last build |

`npm run setup` is only needed for an offline-capable or single-file build —
it's what produces the shareable client preview. It requires network access
and macOS `sips` for image re-encoding. Everyday development doesn't need it.

### Generated vs committed

| File | Committed? | Notes |
|---|---|---|
| `src/fonts.remote.css` | yes | network `@font-face` rules — the default |
| `src/fonts.css` | no | created on install; `npm run setup` replaces it with inlined base64 |
| `src/data/images.json` | no | created empty on install; `npm run setup` fills it with base64 photos |

Konnect is ProDani's licensed typeface. It is referenced by URL from the store's
own CDN and inlined only into local builds — the binaries are never committed here.

## Putting it on the real store

See [`SHOPIFY-INTEGRATION.md`](SHOPIFY-INTEGRATION.md) — whether this can run as React
on the live storefront without going headless (it can), and why I'd still recommend
porting it to Liquid instead.

## Design system

| Role | Face | Used for |
|---|---|---|
| Display | **Fugaz One** | Hero headline, stat figures |
| Script | **Damion** | Section headings, review pull-quotes, marquee, footer wordmark |
| Sans | **Konnect** | Logo, the shouted display type, body, UI |

Fugaz One and Damion are OFL and inlined from Google Fonts. **Konnect is ProDani's own
licensed face** — `scripts/build-fonts.mjs` fetches it from the store's CDN at build
time and the binaries are never committed, so nothing proprietary is redistributed here.

Palette is defined once in `src/index.css`, taken from the live site:

- `--cocoa #48312A` — brand brown, statement bands
- `--pink #FDC3D4` — the joy; used at display scale
- `--cream #FBF5E8` — page ground
- `--butter #FFFBE5` — cards
- `--berry #C4587E` — pink dark enough for small text on cream

Whimsy is carried by structure, not decoration: a 22px house radius on everything,
spring easing (`--bounce`) instead of cinematic curves, a CSS-masked **scalloped hem**
between the chocolate hero and the cream page, hand-drawn SVG squiggles under script
headings, rotated sticker chips, and cards that tilt slightly on hover.

## Structure

```
design/
├── scripts/embed-images.mjs   # asset pipeline
└── src/
    ├── index.css              # tokens, primitives, type scale
    ├── app.css                # section styles
    ├── lib.jsx                # Reveal, WordsUp, CountUp, icons
    ├── data/catalog.json      # 27 real products
    └── components/            # Nav, Hero, Marquee, Shop, Story, Reviews, Footer, CartDrawer
```

## Known constraints

Product photography has **no alpha channel** — every shot is a photo on a light grey
backdrop. This mattered enormously in the earlier dark direction; on a cream page it
mostly resolves itself, since the light backdrops blend into the ground instead of
fighting it.

What does still show: the personal-size range is shot in clear plastic meal-prep
containers with blue and pink cutlery, while the family cakes are on ceramic. That
inconsistency is visible in the grid and is a photography fix, not a layout one.

Motion respects `prefers-reduced-motion` throughout.
