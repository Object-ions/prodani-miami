# Work Log

Newest entries first. One entry per working session — what was done, what was found, what is next.

---

## 2026-08-19 — "The files aren't on my machine" — they were; wrong port

**Reported:** app appeared to be missing locally.

**Actually:** every file was present. Two things caused it.

1. **There is no `package.json` at `~/Desktop/prodani`.** The app is in `design/`.
   Running `npm install` at the repo root finds nothing.
2. **Ports 5173, 5174 *and* 5175 are all occupied on this machine** by an unrelated
   app ("Ticket Queue"). Vite's default is 5173 and it *silently falls forward* to the
   next free port — so `npm run dev` would land somewhere unexpected, and opening
   `localhost:5173` out of habit shows the other app entirely.

**Fix:** pinned the dev server to **5183** with `strictPort: true` and `open: true` in
`vite.config.js`. A port clash now fails loudly instead of drifting, and the browser
opens the right URL by itself. Preview pinned to 4173.

Verified by running `npm run dev` exactly as the client would and checking the served
`<title>` is "ProDani Miami", not the other app.

**Lesson for this repo:** never trust a bare `localhost:5173` when several dev servers
run on this machine — check the port Vite actually prints.

---

## 2026-08-19 — Make the React app runnable with just `npm install`

**Why**

The app was already React (Vite + React 18), but getting it running took three steps and
`npm run setup` needed network access plus macOS `sips`. Too much friction for handing to
someone to run locally.

**Done**

`npm install && npm run dev` is now the whole thing.

- Added `scripts/ensure-assets.mjs`, wired to `postinstall`. If the two generated files
  are missing it creates them: `src/fonts.css` copied from a new committed
  `src/fonts.remote.css` (network `@font-face` rules), and `src/data/images.json` as an
  empty map.
- With images.json empty, `App.jsx` already falls back to the live CDN URLs in
  catalog.json. Added the same fallback to `Story.jsx`, which was the one place reading
  `IMAGES.__story` directly and would have rendered a broken image.
- `npm run setup` still exists and still inlines everything as base64 — now only needed
  for the offline/single-file build. `build:single` runs it automatically.

**Verified from a genuine clean room:** deleted `node_modules`, `dist`, `src/fonts.css`
and `src/data/images.json`, then ran `npm install` and `npm run dev`. Checked in the
browser: 27 products render, all three brand faces (Konnect, Damion, Fugaz One) report
loaded via `document.fonts.check`, images resolve to remote CDN URLs, hero type correct.
`npm run build` also succeeds in that state.

**Bundle sizes now diverge usefully**

| Build | Size | Use |
|---|---|---|
| `npm run build` | ~320 KB | normal dev/deploy, assets over the network |
| `npm run build:single` | ~6.9 MB | one self-contained file, zero requests — the shareable preview |

**Licensing note stays intact:** Konnect is referenced by URL from ProDani's own CDN in
the committed `fonts.remote.css` (4 KB, zero `data:font` URIs). The binaries are only
ever inlined into local, gitignored files.

**Next**

- Client review on the quieter hero.
- Performance work, then re-measure, before deciding React islands vs Liquid.
- Reshoot the personal-size range out of the plastic containers.

---

## 2026-08-19 — Architecture: React on the storefront without going headless

**Question from the client:** can the existing Shopify store use a React frontend, given
we're going to fix the performance flaws anyway?

**Answer: yes, via React islands in the Liquid theme.** Not headless — Liquid still
renders the page, Shopify still owns routing, cart and checkout. Written up in
`design/SHOPIFY-INTEGRATION.md`.

**I revised my own recommendation after checking the data.** My first answer was "don't,
the site is too slow already." Then I broke down the 1,590 ms of blocking time on the
product page:

| ms | Script | Removable |
|---:|---|---|
| 1,735 | Shopify `shop-js` (Shop Pay / Shop app) | Mostly no |
| 1,376 | Document inline scripts | Partly |
| 1,207 | Unattributable | Partly |
| 529 | Judge.me | Yes |
| 485 | Facebook Pixel | Yes |
| 324 | Portable wallets | Only by dropping Shop Pay |
| 272 | Shopify web-pixel-manager | No |
| 137 | Theme `vendor.min.js` | Yes |

**The theme is only ~1,414 ms of 6,392 ms — about 22%.** I had been implicitly blaming
the theme; it isn't the theme. Cutting the Pixel and lazy-loading Judge.me recovers
roughly 1,000 ms; React hydration of a 27-card grid costs roughly 200–400 ms. The client
was right — the arithmetic works.

Caveat kept on record: Shopify's own platform code sets a floor around 2,500 ms that no
optimisation removes, so the headroom is finite.

**What actually decides it turns out not to be speed** — it's the theme editor. Any
section converted to React becomes an opaque box in the customizer, so Dani can't edit
its copy or reorder it without a developer. That cost survives all the performance work.

**Landed on a hybrid**, which is the right shape rather than a compromise: product grid
and cart drawer as React islands (real state, real interaction); hero, story, reviews,
footer and marquees stay Liquid (content Dani edits, zero JS needed).

**Note for whoever builds it:** if we do islands, drop Framer Motion. It's the heavy half
of the prototype (~110 KB unminified, does main-thread layout work) and every animation
in this design is achievable with CSS transitions, keyframes and `IntersectionObserver`.

**Also this session**

- Added `npm run setup` so a fresh clone is two commands to running — it generates the
  gitignored font and image bundles. Verified by deleting both and rebuilding clean.
- Confirmed the design already *is* a React app (Vite + React 18); the shared preview
  link is just a production build of it. Nothing to convert.

**Next**

- Performance work first, then re-measure, so the island decision is made against real
  numbers rather than estimates.
- Client review on the quieter hero.
- Reshoot the personal-size range out of the plastic containers.

---

## 2026-08-19 — Take four: hero dialled back

**Why**

Client: "the hero is too much now." Fair. The type wall was the right call, but I had
stacked confetti sprinkles, a rotating stamp badge, two overlapping cake photos and a
per-letter spring animation on top of the single loudest element on the page. Everything
was shouting at once.

**What changed**

Kept the wall, removed the competition:

- Sprinkles: gone from the hero.
- Rotating stamp badge: removed from the hero, kept in the calmer chocolate mid-band where it has room.
- Two cake photos → one, at roughly half the size, opacity .82, with a gradient dissolving its left edge into the ground so the type reads cleanly over it. Support, not a co-star.
- Per-letter spring → one calm reveal per line. Two moves instead of sixteen.
- Four fact pills → one quiet line of text.
- More padding above and below the wall.

**Correction to the previous entry**

Last session I recorded that both hero lines were "set flush to the same measure" and
reported 1468px for each. That was wrong — `.giant__line` is `display:block`, so I had
measured the container, not the glyphs. The real widths were **746px and 957px**: visibly
ragged, not flush.

Fixed properly this time by measuring per-glyph width against font-size:

- `"BITE INTO"` → 4.0899 px of width per px of font-size
- `"BALANCE"`  → 4.2122

So line 2 must be **0.971×** line 1 for the two to set to one width — the opposite of what
I had assumed (I'd made BALANCE *larger*, on the reasoning that fewer glyphs need more
size; in fact BALANCE's round wide letters more than compensate for the shorter string).
Ratio is now held across the entire clamp range. Verified in the browser: **909px vs 910px**.

They also now set to about 62% of the measure rather than filling it, which is a large
part of why the hero reads calm.

**Next**

- Client review on the quieter hero.
- Reshoot the personal-size range out of the plastic containers.
- On sign-off, port to Liquid and fold in the audit fixes.

---

## 2026-08-19 — Take three: type-wall hero + flare pass

**Why**

Client: "still missing a little bit of flare, also — I don't like the hero." The hero was
the most conventional thing on the page (split layout, headline left, cake in a circle
right) and all the big-type energy was buried below the fold. Offered four hero
directions with mockups; client picked the **giant type wall**.

**New hero**

The whole viewport is now "BITE INTO BALANCE" in pink Konnect ExtraBold on chocolate,
with product photos cropped in around the letters.

- **Both lines are set flush to the same measure.** "BITE INTO" is 9 glyphs and "BALANCE"
  is 7, so a single `font-size` leaves the second line short. Sized per line instead
  (15.2vw / 19vw) — both now measure identically and the block reads as a wall, not a
  ragged heading. This is the detail that makes it work.
- Letters spring in one at a time from behind overflow masks.
- Two cake photos in circles, one behind the type and one in front, which is what gives
  flat type actual depth. Both are **plate-shot family cakes** — deliberately avoiding
  the personal range, whose plastic meal-prep containers look bad at this scale.
- Confetti sprinkles drifting round the edges, pushed out of the middle band so they
  don't read as specks on the type.
- The tagline "The power of protein. The joy of cake." survives as the kicker above.

**Flare added elsewhere**

- **Rotating stamp badge** — words chasing their own tail round a circle via SVG
  `textPath`, with a cupcake in the middle. One in the hero, one in the chocolate band.
- **Squiggles now draw themselves on** when scrolled into view (animated `pathLength`).
- **Quick-add pill** rises out of each product card's image well on hover.
- **Second marquee** under the chocolate band, running the opposite direction in
  chocolate-on-pink so the pair reads as deliberate rather than repeated.
- **Cart pill pops** when something lands in it.

**Also**

The mid-page chocolate band used to be "BITE INTO BALANCE" — now redundant, so it
carries the other half of the brand line ("Where sweet meets balance") instead.

**Next**

- Client review on the type-wall hero.
- Reshoot the personal-size range out of the plastic containers — now blocking two
  things, since those photos also can't be used at hero scale.
- On sign-off, port to Liquid and fold in the audit fixes.

---

## 2026-08-19 — Redesign, take two: whimsical, on brand colours

**Why**

The dark editorial pass read as too "powerful" for the brand. Client pointed at ProDani's
own existing colour scheme instead — chocolate, pink, cream — and asked for whimsical.

**Done**

- Went and looked at the live site properly this time (the audit only ever parsed its HTML, never rendered it) and pulled the real brand tokens straight off the DOM:
  - `#48312A` chocolate · `#FDC3D4` pink · `#FBF5E8` cream · `#FFFBE5` butter
  - **Konnect** (Medium/SemiBold/Bold/ExtraBold) for headings and UI, **Damion** script, **Fugaz One** display — the store's actual stack.
- Rewrote the whole design system around them. Both CSS files replaced, every component reworked.
- Added `scripts/build-fonts.mjs`. Damion and Fugaz One are OFL and inlined from Google Fonts; Konnect is fetched from ProDani's own CDN at build time and **never committed** — `design/src/fonts.css` is now gitignored. Verified nothing proprietary ever reached the public repo (the pushed version only ever held Instrument Serif / Inter / JetBrains Mono).
- Republished to the same preview URL: https://claude.ai/code/artifact/856a201e-d0c7-4cea-b59c-ebffaf799f22

**Where the whimsy actually comes from**

Structure, not stickers: a 22px house radius on everything (the previous pass had zero radius throughout), spring easing instead of cinematic curves, a CSS-masked **scalloped hem** between the chocolate hero and the cream page, hand-drawn SVG squiggles under the script headings, rotated sticker chips on the hero, cards that tilt on hover, a Damion-script marquee, and giant cropped pink Konnect for "BITE INTO BALANCE" and a scrolling "DELICIOUS" band — both straight from the client's own reference screenshots.

**Two bugs caught and fixed during review**

1. `.lede` defaults to dark ink; the hero sits on chocolate and had no override, so the hero paragraph was dark-brown-on-brown and nearly unreadable. Added explicit overrides for every dark-ground section.
2. `.stat span` was also matching the CountUp component's inner `<span>`, shrinking the stat figure to 13.5px and forcing `display:block`, so "20g" rendered as a tiny "2" above a huge "g". Scoped to `.stat > span`. Swept the rest of the stylesheet for the same class of loose descendant selector.

**Note on tooling**

Browser screenshots during review kept showing blank or half-faded sections. That is Chrome throttling `requestAnimationFrame` in a background tab, freezing Framer Motion mid-animation — not a defect in the page. Worth remembering next session: force a repaint, or inject `*{opacity:1!important}`, before judging a screenshot.

**Unexpected upside**

The light-backdrop product photography that was a real problem in the dark direction largely stops mattering here — on a cream page the backdrops blend into the ground instead of fighting it. The plastic-container shots for the personal range are still the weak link, and that stays a photography fix.

**Next**

- Get a direction call from the client on this vs. the dark version.
- Reshoot the personal-size range out of the plastic meal-prep containers.
- On sign-off, port to Liquid and fold in the audit fixes (hero video, meta descriptions, `aggregateRating`, viewport tag).

---

## 2026-08-19 — Redesign concept (dark editorial direction)

**Done**

- Studied the client's reference, `davidprotein.com/collections/shop-bars`, and pulled its actual design system rather than eyeballing it: **Instrument Serif** (display) + Suisse Intl (body) + ABC Monument Grotesk Mono (utility), pure-black ground, **zero border-radius on containers**, pill buttons, hairline seams between product cards, and an oversized serif filter row standing in for a conventional filter bar.
- Built a full redesign concept as a React app in `design/` — Vite + React 18 + Framer Motion, custom CSS (no utility framework).
- Ran it on the **real catalog**: 27 products pulled from `products.json` with real names, prices and photography, plus verbatim Judge.me review copy.
- Substituted free equivalents for the two commercial faces: Instrument Serif is OFL so it is used directly; Inter replaces Suisse Intl and JetBrains Mono replaces Monument Grotesk Mono. All three self-hosted as base64 `@font-face` — no font CDN, no render-blocking request.
- Wrote `scripts/embed-images.mjs` to inline all 56 product photos as base64 JPEGs (via macOS `sips`), so the single-file build renders with **zero network requests**.
- Published a shareable client preview: https://claude.ai/code/artifact/856a201e-d0c7-4cea-b59c-ebffaf799f22

**Sections built**

Rotating announcement · sticky nav · hero with word-by-word serif reveal, parallax and floating nutrition chips · infinite claims marquee · oversized serif filter row with animated underline · 27-product grid with hover crossfade and quick-add · scroll-triggered count-up stats · brand story · reviews · closing CTA · footer · spring cart drawer.

**Direction taken**

David's palette is cold — bronze, gold, black. ProDani's brand is warm ("The joy of cake", "Bite into balance", Miami, small-batch), so the concept keeps David's structural rigour but re-pitches the colour: warm black `#0A0908`, cream `#F7F2EA`, caramel `#E0A458` as the single loud accent, coral and leaf for category and vegan markers.

**Blocker for the client — product photography**

Every product image is a photo on a light grey backdrop with **no alpha channel** (verified: 0% transparent pixels). The reference look depends on products cut out or shot on black. The concept works around it — the hero shot is framed as a circular plate, card images run full-bleed under a warm grade — but this caps how far the direction can go.

Separately, the **personal-size range is photographed in clear plastic meal-prep containers with blue and pink plastic cutlery**, while the family cakes are shot on ceramic. That inconsistency undercuts the premium positioning the whole direction rests on, and no amount of layout fixes it.

**Next**

- Decide dark-luxe (this concept) vs. a lighter editorial treatment before any theme work starts.
- Commission cutout or dark-background product photography — highest-leverage item for this direction.
- Reshoot the personal-size range out of the plastic containers.
- Once the direction is signed off, port to Liquid and fold in the audit fixes (hero video, meta descriptions, `aggregateRating`, viewport tag).

---

## 2026-08-19 — Site audit + repo setup

**Done**

- Ran Lighthouse (v13.4.1, mobile emulation, headless Chrome) against three templates: homepage, `/collections/all-products`, and `/products/strawberry-short-cake`. Reports saved to `audit/`.
- Crawled on-page SEO signals for the same three pages — titles, meta descriptions, canonicals, heading hierarchy, image alt coverage, JSON-LD, robots meta, Open Graph. Output in `audit/seo-crawl.json`.
- Wrote `audit/AUDIT.md` with ranked SEO / Design-UX / Speed fix lists split into "Do now" and "Later".
- Initialised the Git repo, added a deliberately over-broad `.gitignore`, and wrote `README.md` and this log.

**Scores**

| Page | Perf | A11y | Best Prac. | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Home | 55 | 72 | 73 | 85 | 7.8 s | 660 ms | 0.052 |
| Collection | 74 | 74 | 77 | 92 | 3.8 s | 550 ms | 0 |
| Product | 45 | 74 | 77 | 92 | 9.9 s | 1,590 ms | 0.027 |

**Key findings**

1. **A 5.6 MB hero video is 73% of the homepage payload** (7,726 KB total) and is the direct cause of the 7.8 s LCP. Single highest-impact fix on the site.
2. Homepage and collection page have **no meta description** at all; homepage `<title>` is 13 characters and brand-only.
3. Collection template renders **zero `<h1>`**; homepage renders **two**, one of them empty.
4. Product JSON-LD carries **no `aggregateRating` or `review`** despite 70+ Judge.me reviews — no star snippets in search results.
5. `user-scalable=0` in the viewport meta **blocks pinch-zoom on mobile** across all templates (WCAG failure).
6. Colour-contrast failures: 12 on home, **104 on collection**, 17 on product — mostly inside the Judge.me review widget.
7. Third-party JS is the main TBT driver: Facebook Pixel ~175 KB per page, plus checkout bundles (289 KB) loading on browse pages where they are not needed.
8. `og:image` on home and collection is the **logo as an SVG served over http://** — social shares render blank.
9. Homepage throws `TypeError: Cannot read properties of undefined (reading 'dataset')` in `theme-global.js` on load.
10. The age-verifier component is disabled (`data-enable="false"`) but still ships its markup and stylesheet on every page, injecting two stray `<h2>`s into every heading outline.

**Notes**

- `audit/raw/` (full-page HTML scrapes) is gitignored — regenerable, ~1 MB, and embeds store-internal markup.
- No theme source pulled yet; this session was audit-only against the live site.

**Next**

- Pull the theme with `shopify theme pull` so fixes can be made in source control.
- Start with the hero video, then meta descriptions and titles, then the viewport tag.
- Re-run Lighthouse after the video fix to confirm the LCP improvement before moving on.
