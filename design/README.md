# ProDani Miami — redesign concept

A dark editorial storefront concept, built as a React app. Direction taken from
[davidprotein.com](https://davidprotein.com) at the client's request, re-pitched
around ProDani's own brand values — warmth, small-batch, Miami — rather than
David's cold bronze-and-black.

Runs on the **real catalog**: 27 products pulled from `products.json`, real prices,
real photography, real Judge.me review copy.

## Run it

```bash
cd design
npm install
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
| Display | Instrument Serif | Headlines, filter row, stat figures, footer wordmark |
| Body | Inter | Product names, running copy, navigation |
| Utility | JetBrains Mono | Eyebrows, badges, prices, labels |

All three are OFL/free and self-hosted as base64 `@font-face` in `src/fonts.css` —
no font CDN, no render-blocking request.

Palette is defined once in `src/index.css`:

- `--ink #0A0908` — warm black, never pure `#000`
- `--cream #F7F2EA` — primary text
- `--caramel #E0A458` — accent; the one loud colour
- `--coral #FF7A5C` / `--leaf #8FBF6F` — category and vegan markers

Structural rules borrowed from the reference: **zero border-radius on containers**
(pills only on buttons), hairline seams instead of gaps between cards, and an
oversized serif filter row in place of a conventional filter bar.

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
backdrop. The reference site's look depends on products cut out or shot on black.
The concept works around this by framing the hero shot as a circular plate and
running card images full-bleed with a warm grade. Cutout or dark-background
photography would let the design go considerably further.

Motion respects `prefers-reduced-motion` throughout.
