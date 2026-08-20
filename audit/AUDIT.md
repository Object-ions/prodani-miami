# ProDani Miami — Site Audit

**Date:** 2026-08-19 · **Site:** prodanimiami.com · **Platform:** Shopify
**Method:** Lighthouse 13.4.1 (mobile emulation, headless Chrome) + HTML crawl of 3 templates.
Raw reports: `lighthouse-{home,collection,product}.html/.json`, `seo-crawl.json`.

## Scores

| Page | Perf | A11y | Best Prac. | SEO | LCP | TBT | CLS | Weight |
|---|---|---|---|---|---|---|---|---|
| Home | **55** | 72 | 73 | 85 | **7.8 s** | 660 ms | 0.052 | **7,726 KB** |
| Collection (all-products) | 74 | 74 | 77 | 92 | 3.8 s | 550 ms | 0 | 1,883 KB |
| Product (strawberry-short-cake) | **45** | 74 | 77 | 92 | **9.9 s** | **1,590 ms** | 0.027 | 2,639 KB |

---

## 🔴 Highest-impact fix (do this first)

**Kill the 5.6 MB hero video on the homepage.**
`cdn.shopify.com/videos/c/o/v/5cb3aeadf0864053899148b99e96d5ff.mp4` is **5,646 KB — 73% of the entire homepage payload** (7,726 KB total). It is the reason LCP is 7.8 s and Performance sits at 55.

Fix, in order of preference:
1. Replace with a compressed poster image (WebP, <150 KB) and lazy-load the video only after first interaction / on desktop only.
2. If the video must autoplay: re-encode to H.264 720p at ~1.5 Mbps + a WebM/AV1 source, target **under 1.5 MB**, add `preload="none"` + `poster=`.

Expected: homepage weight drops ~5 MB, LCP moves from ~7.8 s toward ~2.5 s, Performance 55 → ~85. Nothing else on this list comes close.

> **Done — ready to upload.** `assets/hero-video-optimised.mp4` is this exact video
> re-encoded: **5,638 KB → 374 KB (93% smaller)**, audio stripped (it can never play on a
> muted autoplaying background video), CRF 27 at 24fps, visually indistinguishable from
> the source. A poster frame is included. See `assets/README.md`.

---

## 1. SEO

Both the homepage and collection page are missing basic on-page signals. Product pages are in decent shape structurally but are leaving rich results on the table.

### Do now
1. **Add meta descriptions.** Home and collection have **none** (Lighthouse SEO fail on both). Product pages have one. Write 150–160 chars per template.
2. **Fix the homepage title.** `"ProDani Miami"` — 13 chars, brand only, zero keywords. Target something like `High-Protein Cakes & Muffins Delivered | ProDani Miami` (~55 chars).
3. **Fix the collection title.** `"All Products"` — 12 chars, no brand, no category. Should be `All Protein Cakes & Muffins | ProDani Miami`.
4. **Add `aggregateRating` + `review` to Product JSON-LD.** The site has 70+ five-star Judge.me reviews, but the Product schema contains **no rating data** — so Google shows no star snippets. This is free CTR. Also add `sku`.
5. **Collection page has zero `<h1>`.** 28 product titles are all `<h3>` with nothing above them. Add an `<h1>` to the collection template.
6. **Homepage has 2 `<h1>` tags, one of them empty.** Remove the empty one; keep `"The power of protein. The joy of cake."`
7. **Fix `og:image` on home + collection.** It currently points at the **logo as an SVG**, served over **`http://`**. Facebook, LinkedIn and X do not render SVG OG images — shares show blank. Use a 1200×630 JPG/PNG over HTTPS. Also add `twitter:image` (missing on all pages).

### Later
8. Add `BreadcrumbList` schema — **absent on all three templates.**
9. Clean the `Organization` schema: `sameAs` contains **6 empty strings** alongside the 2 real profiles.
10. Brand name is inconsistent: Product schema says `"Dani Pro Miami"`, Organization says `"ProDani Miami"`. Pick one.
11. `og:description` on home and collection is just `"ProDani Miami"` — duplicate of the title. Use the real meta description.
12. Add `ItemList` schema to collection pages.
13. Collection loads all 28 products with no pagination (`rel=next/prev` absent) — fine at this catalog size, revisit past ~50 SKUs.

---

## 2. Design / UX & Accessibility

Accessibility is 72–74 across all templates. The contrast and unnamed-control failures are the actionable ones.

### Do now
1. **Remove `user-scalable=0` from the viewport meta.** Current tag: `width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0`. This **blocks pinch-zoom on mobile** — a WCAG failure and a real problem for a food site where customers zoom into product photos and ingredient lists. Fails on all 3 pages.
2. **Fix color contrast.** 12 failures on home, **104 on the collection page**, 17 on product. Most are in the Judge.me review widget (`jdgm-histogram__frequency`, `jdgm-rev__timestamp`, `jdgm-medal__value`) — grey-on-white below 4.5:1. Override the widget's text colors in theme CSS.
3. **Name the unlabeled controls.** `link-name` fails: **30 links on the collection page**, 3 on home (including the cart icon and logo link). `button-name` fails: 8 buttons on product, 1 on home (scroll-to-top). Add `aria-label`.
4. **Add alt text.** Coverage is poor: home **7/24** images have meaningful alt, collection **30/59**, product **3/33**. Many have `alt=""` (decorative) when they are product photography. Lighthouse flags 4 images on home with **no `alt` attribute at all**.

### Later
5. **Fix the JS error on the homepage.** `TypeError: Cannot read properties of undefined (reading 'dataset')` in `theme-global.js` → `handleChange`. Throws on load; likely a broken variant/option selector.
6. **Malformed list markup.** `<li>` elements outside any `<ul>/<ol>` (4 on every page) and a `<ul>` containing non-`<li>` children — in the footer accordion.
7. **Product images ship `width="" height=""`** (empty attributes). Set real dimensions to protect CLS.
8. **Remove the dead age-verifier.** `<m-age-verifier-popup data-enable="false">` — it's disabled, but still ships its markup, its own stylesheet (`age-verifier.css`), and injects two stray `<h2>`s ("Confirm your age" / "Come back when you're older") into **every page's heading outline**.
9. Heading hierarchy jumps h1 → h3 on home (search drawer sits at h3).

---

## 3. Speed

Server response is fine (60 ms). Everything wrong here is payload and third-party JavaScript.

### Do now
1. **The 5.6 MB hero video** — see the top of this report. Single biggest item.
2. **Cut third-party JS.** Facebook Pixel alone is **~175 KB** (`fbevents.js` 105–109 KB + `signals/config` 66–68 KB) on every page. Plus Shopify's web-pixel-manager (71 KB). This is the main driver of TBT: **1,590 ms on product**, 660 ms on home. Audit which pixels are actually in use and drop the rest.
3. **Stop loading checkout bundles on browse pages.** `checkout-web/assets/c1/hydrate.js` (199 KB) and `shipping-methods-grouping.js` (90 KB) load on home, collection **and** product — pages where nobody is checking out. Defer to the cart/checkout step.
4. **Un-block rendering on fonts.** The Google Fonts stylesheet (`Bungee`, `Damion`, `Fugaz+One`) costs **791 ms of render-blocking time** — the largest single blocker. Self-host the woff2 files with `font-display: swap` and preload only what's above the fold. Lighthouse estimates **730 ms** recoverable from render-blocking overall.
5. **Convert the `.otf` fonts to woff2.** `KonnectMedium.otf` (54 KB) and `KonnectSemiBold.otf` (53 KB) are raw OpenType — woff2 typically cuts these by ~50%. Total font weight is 354 KB on home, 282 KB on product.

### Later
6. **Unused JavaScript:** 91 KB on home/collection, **129 KB on product**.
7. **Legacy JS polyfills:** 40–67 KB shipped needlessly, from `app.min.js`, `header.min.js`, `footer.min.js` and `fbevents.js`.
8. **Cache policy:** 153–247 KB re-fetched on repeat visits due to short TTLs.
9. **Unused CSS:** ~11 KB, plus the theme ships **14 stylesheets on home and 39 on the collection page**. Consolidate.
10. **Oversized images:** ~152 KB recoverable on home, **187 KB on product**. Worst: `DANI_X_*.png` (56 KB), `DARKCHOCOLATECHIPMUFFIN_1.png`, `section.png`. Serve WebP/AVIF instead of PNG.
11. **Request count is high:** 198 on home, 218 on collection, **354 on product**. TTI is 10.6–14.4 s across all three.

---

## Quick reference — what to hand a developer first

| # | Fix | Page(s) | Impact |
|---|---|---|---|
| 1 | Compress/lazy-load the 5.6 MB hero video | Home | Perf 55 → ~85 |
| 2 | Add meta descriptions + rewrite titles | Home, Collection | Ranking + CTR |
| 3 | Add `aggregateRating` to Product schema | Product | Star snippets in SERPs |
| 4 | Remove `user-scalable=0` | All | WCAG + mobile UX |
| 5 | Defer Facebook Pixel & checkout bundles | All | TBT 1,590 → ~400 ms |
| 6 | Add `<h1>` to collection template | Collection | On-page SEO |

*Scores are single-run mobile Lighthouse results and will vary ±5 between runs. Re-measure after fix #1.*
