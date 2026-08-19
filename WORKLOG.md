# Work Log

Newest entries first. One entry per working session — what was done, what was found, what is next.

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
