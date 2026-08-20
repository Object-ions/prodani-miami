# Work Log

Newest entries first. One entry per working session — what was done, what was found, what is next.

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
