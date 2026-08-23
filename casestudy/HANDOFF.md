# Handoff: ProDani Miami case study → switchcasestudio.com

You are adding this project to the Switch Case Studio site as a case study. This file is
the context; the assets sit alongside it in this folder.

---

## 1. Assets, and which to reach for

Everything is in this folder. Paths below are relative to it.

| You need | File |
| --- | --- |
| The full written case study | `copy.md` |
| Every measurement as a table | `metrics.csv` |
| A ready-made page you can lift markup from | `page/index.html` |
| Thumbnail / index tile / social card | `images/cover-1200x630.jpg` |
| The one image that tells the story | `images/pairs/home.jpg` |
| Per-section comparison images | `images/pairs/{product,baker,contact}.jpg` |
| Individual screenshots | `images/{before,after}/{page}-1150.jpg` |
| Whole-page shots (very tall) | `images/{before,after}/{page}-fullpage.jpg` |
| The raw data, if you want to recompute | `data/metrics-post-launch.json` |

**`copy.md` is the source of truth for words. `metrics.csv` is the source of truth for
numbers.** Both are generated from the JSON by `build.py` — do not retype figures out of
this file or out of the rendered page. If you need a number that is not in the CSV, take
it from `data/metrics-post-launch.json` rather than inferring it.

### Image dimensions

| File pattern | Size | Notes |
| --- | --- | --- |
| `cover-1200x630.jpg` | 1200 × 630 | Standard OG ratio |
| `pairs/*.jpg` | 2324 × 1076 | Before and after side by side, labelled |
| `*/[page]-1150.jpg` | 1150 × 1000 | The measured viewport |
| `*/[page]-fullpage.jpg` | 1150 × up to 10,718 | Entire document; needs a scrolling frame |

The full-page shots are genuinely enormous — the new homepage is 10,718px tall. Put them
in a fixed-height container with `overflow: auto`, never at natural size.

Suggested alt text: *"The ProDani Miami homepage on the old theme"* / *"…on the rebuilt
theme"*. For the pairs: *"The ProDani Miami homepage before and after the rebuild, both at
1150 pixels wide"*.

---

## 2. What the project was

ProDani Miami is a Miami bakery selling high-protein, no-added-sugar cakes and muffins.
Founded by Daniel, a personal trainer. Shopify store at **prodanimiami.com**.

They were running **Minimog**, a bought Shopify theme. We rebuilt the storefront from
scratch as a bespoke theme on **Dawn 16**, and it went live on **23 August 2026**.

The distinguishing thing about this project — and the angle the case study should lead
with — is that **the before and after were measured, not estimated.** Most redesign case
studies assert an improvement. This one has an instrument, a method, and raw data anyone
can check.

---

## 3. What we actually did

Scope, in the order it matters to a reader:

- **Rebuilt the storefront** as a custom Shopify theme on Dawn 16: new header, hero with
  video, an animated wave marquee, a filterable product collection with rows per category,
  a scroll-stacking stats deck, a Meet Your Baker section, a full-bleed type moment, a
  reviews block, a contact block with a real enquiry form, and a new footer.
- **Re-encoded the hero video** from 5.6MB to 375KB. This single change is roughly three
  quarters of the homepage weight saving.
- **Brought fonts in-house.** Google Fonts was a blocking third-party request on every
  page. Three self-hosted woff2 files (42KB total) replaced it.
- **Made the reviews real.** The old product page showed a dead five-star widget reading
  "No reviews". The rebuild embeds the store's actual Judge.me account — the homepage
  carries the store-wide feed, and product pages carry their own widget with a working
  write-a-review flow.
- **Rebuilt the contact page.** Two fields and a message box became name, email, phone,
  subject and message, on a panel next to a map.
- **Computed the colour contrast** rather than eyeballing it. Every text and control pair
  was checked against WCAG before it shipped.
- **Fixed the document structure.** One `<h1>` per page across all sixteen routes, alt text
  on every homepage image, and six levels of nesting removed from the product page.
- **Rescued copy that was trapped in the old theme.** Dani's story and the contact details
  lived in Minimog's theme settings, not in the Shopify page records — a naive theme swap
  would have blanked both pages. They were extracted verbatim first.
- **Wrote a check suite** that runs read-only against the storefront: every route renders
  without a Liquid error, add-to-cart works end to end, no stock theme markup leaks
  through, every asset resolves, one `<h1>` per page, every image has alt text. It ran
  before publishing and again against the live site afterwards. **89 checks, 0 failures.**

---

## 4. The numbers

Median of five interleaved runs, cache disabled, at a pinned 1150 × 1000 viewport.

**Headline four** — these are the ones for a summary block:

| | Before | After | |
| --- | ---: | ---: | ---: |
| Homepage weight | 6.95MB | 1.83MB | −74% |
| Homepage largest contentful paint | 768ms | 352ms | −54% |
| Product page layout shift | 0.0753 | 0.0118 | −84% |
| Server response, average of four pages | 151ms | 51ms | −66% |

**Also strong, if you want more:**

| | Before | After | |
| --- | ---: | ---: | ---: |
| Product page DOM elements | 2,021 | 643 | −68% |
| Product page LCP | 1,172ms | 352ms | −70% |
| Product page nesting depth | 23 levels | 17 | −26% |
| Homepage third-party hosts | 8 | 6 | −25% |
| Homepage JavaScript | 1,122KB | 710KB | −37% |
| Homepage CSS | 384KB | 222KB | −42% |

Per-page figures for all four pages are in `metrics.csv`.

### The method matters — keep it

The method section is what makes these numbers quotable, and it is the actual
differentiator. If you cut it to save space, cut the numbers with it. In short:

- **Exactly 1150 × 1000 CSS pixels**, pinned with Chrome's device-metrics override at DPR 1.
  Both versions, no exceptions.
- **Five runs per page per version, cache disabled, interleaved** — before, after, before,
  after. Running all of one version first would let a slow minute on the network land
  entirely on one side and read as a design result. Reported value is the median.
- **Headless Chrome over the DevTools protocol.** Paint and layout-shift figures come from
  PerformanceObserver hooks installed before the first byte, because LCP and layout-shift
  entries cannot be recovered after the fact.
- **One catalogue, two themes** — identical products, prices, apps and pixels on both
  sides, so the theme is the only variable.
- **Measured twice.** Once before launch with the old theme live and the new one in
  preview, and again after launch with those roles reversed. Only a published theme gets
  Shopify's full page cache, so the cache bias ran one way in the first run and the other
  way in the second. Server response came back at −68%, then −69%. That is a real
  difference in render time, not a caching artefact. **Published figures are from the
  post-launch run, against the live site.**

---

## 5. What got worse — this stays in

Four figures moved the wrong way. They are in `copy.md`, they are footnoted in
`metrics.csv`, and they belong on the published page.

- **The homepage is 69% taller and carries 54% more elements.** It went from four sections
  to nine. Deliberate: a shopper who used to leave the homepage knowing nothing now passes
  the catalogue, the claims, the baker and the reviews on the way down.
- **The product page is 5% heavier** (1.91MB → 2.01MB). Scripts dropped, but the gallery
  serves larger photographs and the page now carries a working reviews widget it did not
  have at all. The wins there are layout shift and DOM size, not bytes.
- **The contact page finishes loading 9% slower** — the only page where that is true. The
  embedded map costs more than the removed scripts saved. Paint is still 20% faster, so it
  is usable sooner even though it finishes later.
- **Both versions still load around 150 scripts.** Almost all of it is Shopify apps and
  pixels, which live outside the theme entirely. A theme rebuild cannot remove them.

Reasoning, so you do not talk yourself out of it: anyone technical enough to be impressed
by a −74% is technical enough to notice that every single figure is green. Including the
four that are not is what makes the other forty credible. It is also the most
Switch-Case-Studio thing on the page.

---

## 6. Do not claim

Things that are not true, or that we have no evidence for:

- **No conversion, revenue, traffic or sales figures.** We have none. Do not write
  "increased sales by", do not imply a commercial outcome, do not use a placeholder.
- **No Lighthouse or PageSpeed score.** We never ran one. The figures are from the
  Navigation Timing and PerformanceObserver APIs directly. Do not translate them into a
  score out of 100.
- **No Core Web Vitals "pass" claim.** We measured LCP and CLS in a lab at one viewport on
  one connection. That is not field data and not a CWV assessment.
- **Not a migration or a replatform.** It was a Shopify theme publish. Products, orders,
  customers and checkout are store data, not theme data, and were never touched.
- **Not a rescue from a broken site.** The old site worked. It was a bought theme carrying
  a 5.6MB video and a lot of markup. Say that plainly rather than implying negligence.
- **Do not name the old theme pejoratively.** Minimog is a legitimate commercial theme.
  The story is bespoke-beats-generic, not vendor-bashing.
- **The store is a real business with a real owner.** Do not invent quotes from Daniel, do
  not fabricate a testimonial, and do not attribute opinions to the client.

---

## 7. Suggested page structure

Adapt to the site's existing case-study template; this is the content order that works:

1. **Cover** — `images/cover-1200x630.jpg` or the homepage pair, with the headline four.
2. **The project in two sentences** — who ProDani are, what they were running.
3. **The angle** — measured, not estimated. This is the hook, put it early.
4. **The four headline numbers** as a stat block.
5. **How it was measured** — condensed to four or five bullets. Do not drop it.
6. **Page by page** — homepage, product, Meet Your Baker, contact. Each gets its pair image
   and its own numbers. `copy.md` has a short paragraph for each.
7. **Beyond the numbers** — the reviews, the fonts, the contrast work, the structural fixes.
8. **What got worse** — as its own section, not a footnote.
9. **Credit and link** to prodanimiami.com.

If the template only has room for a short piece, keep: the angle, the four numbers, a
two-line method note, one pair image, and the "what got worse" section. Those five things
carry the whole argument.

---

## 8. Credits and links

- **Client:** ProDani Miami — https://prodanimiami.com
- **Studio:** Switch Case Studio — https://switchcasestudio.com
- **Launched:** 23 August 2026
- **Platform:** Shopify, custom theme on Dawn 16
- **Previous theme:** Minimog (OS 2.0)

---

## 9. Not for publication

Open items on the client's side. Context for you, not content for the page:

- None of the store's 70+ Judge.me reviews are attached to a product, so every product
  page shows "Be the first to write a review". That is a data issue on the client's side.
  Do not present per-product reviews as a live outcome — the integration works, the data
  behind it is incomplete.
- The circular footer logo artwork reads "HIGH PROTEIN DESERTS" (missing an S). It is the
  client's original artwork and is visible in `images/after/*-fullpage.jpg`. If you crop a
  screenshot for the case study, avoid framing it.
- Some placeholder photography is still in place pending the client's own images.
