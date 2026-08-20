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
cd design
npm install
node scripts/build-fonts.mjs    # inlines the brand fonts (required once)
node scripts/embed-images.mjs   # downloads + inlines product photos (required once)
npm run dev
```

`scripts/embed-images.mjs` writes `src/data/images.json` (~6 MB of base64 JPEGs).
That file is generated, so it is gitignored — run the script after cloning.
It shells out to macOS `sips` for JPEG re-encoding.

## Build

```bash
npm run build              # normal dist/
SINGLEFILE=1 npm run build # one self-contained dist/index.html, no external requests
```

The single-file build is what gets published as the shareable client preview —
everything (fonts, images, CSS, JS) is inlined, so it renders under a strict CSP.

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
