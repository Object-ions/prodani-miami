# ProDani Miami — storefront rebuild

**Client** ProDani Miami, a Miami bakery selling high-protein, no-added-sugar desserts
**Site** prodanimiami.com (Shopify)
**Studio** Switch Case Studio
**Launched** 23 August 2026

---

## The short version

ProDani was running a bought Shopify theme. We rebuilt the storefront from scratch as a
bespoke theme on Dawn, then measured both versions through the same instrument, at the
same viewport, on the same afternoon — and again after launch, to be sure the result was
not an artefact of how the two were being served.

| | Before | After | |
| --- | ---: | ---: | ---: |
| Homepage weight | 6.95MB | 1.83MB | −74% |
| Homepage LCP | 768ms | 352ms | −54% |
| Product layout shift | 0.0753 | 0.0118 | −84% |
| Server response, all pages | 151ms | 51ms | −66% |

---

## How it was measured

Numbers in a redesign case study are usually estimates. These are not, and the method is
worth stating because it is what makes them worth quoting.

- **Viewport** — exactly 1150 x 1000 CSS pixels, pinned with Chrome's device-metrics
  override at a device pixel ratio of 1. Both versions, no exceptions.
- **Runs** — five per page per version, cache disabled on every one, and *interleaved*:
  before, after, before, after. Running all of one version first would let a slow minute
  on the network land entirely on one side and read as a design result. Reported value is
  the median.
- **Instrument** — headless Chrome driven over the DevTools protocol. Paint and
  layout-shift figures come from PerformanceObserver hooks installed before the first byte
  of the document, because layout-shift and LCP entries cannot be recovered after the fact.
- **Same store** — identical products, prices, apps and pixels on both sides. One
  catalogue, two themes, so the theme is the only variable.
- **Measured twice** — once before launch with the old theme live and the new one in
  preview, and again after launch with those roles reversed. Only a published theme gets
  Shopify's full page cache, so the cache bias ran one way in the first run and the other
  way in the second. Server response came back at -68%, then -69%. It is a real difference
  in render time, not a caching artefact. Figures here are from the post-launch run.

---

## Page by page

### Homepage
`/`

A 5.6MB hero video, served raw. Re-encoding it to 375KB is where three quarters of the homepage weight went — and it is why the largest element on the screen now paints in a third of the time.

| Measure | Before | After | Change |
| --- | ---: | ---: | ---: |
| Time to first byte | 152ms | 47ms | −69% |
| First contentful paint | 424ms | 352ms | −17% |
| Largest contentful paint | 768ms | 352ms | −54% |
| Load complete | 1,223ms | 1,117ms | −9% |
| Cumulative layout shift | 0.0067 | 0.0042 | −38% |
| Page weight transferred | 6.95MB | 1.83MB | −74% |
| Requests | 216 | 214 | −1% |
| Loaded from other hosts [^home1] | 6.28MB | 423KB | −93% |
| DOM elements [^home2] | 1,135 | 1,745 | +54% |
| Deepest nesting level | 18 | 16 | −11% |
| Full page height [^home3] | 6,336px | 10,718px | +69% |

[^home1]: Other hosts includes Shopify’s own CDN, which is where the hero video was served from — so most of this line is the 5.6MB video, not tracking scripts.
[^home2]: The old homepage had four sections. The new one has nine, so it is a bigger document by design — the weight went down anyway.
[^home3]: Longer on purpose: the collection rows, the stat deck, Meet Your Baker and the reviews all live on the homepage now.

### Product page
`/products/family-orange-cake`

The old page nested 23 levels deep across 2,026 elements to show one cake. Layout shift was 0.076 — visible movement under the buyer’s thumb while the page settled. Both numbers are now a fraction of that.

| Measure | Before | After | Change |
| --- | ---: | ---: | ---: |
| Time to first byte | 150ms | 53ms | −65% |
| First contentful paint | 488ms | 352ms | −28% |
| Largest contentful paint | 1,172ms | 352ms | −70% |
| Load complete | 1,745ms | 1,398ms | −20% |
| Cumulative layout shift | 0.0753 | 0.0118 | −84% |
| Page weight transferred [^product1] | 1.91MB | 2.01MB | +5% |
| Requests | 309 | 283 | −8% |
| Loaded from other hosts | 765KB | 676KB | −12% |
| DOM elements | 2,021 | 643 | −68% |
| Deepest nesting level | 23 | 17 | −26% |
| Full page height | 3,431px | 2,783px | −19% |

[^product1]: Heavier, and on purpose. Scripts dropped, but the gallery serves larger photographs and the page now carries a working reviews widget it did not have at all before.

### Meet Your Baker
`/pages/meet-your-baker`

Dani’s story was trapped in theme settings rather than the page record. It was lifted out verbatim, then given a layout instead of a wall of centred text.

| Measure | Before | After | Change |
| --- | ---: | ---: | ---: |
| Time to first byte | 150ms | 54ms | −64% |
| First contentful paint | 392ms | 352ms | −10% |
| Largest contentful paint | 604ms | 368ms | −39% |
| Load complete | 1,048ms | 828ms | −21% |
| Cumulative layout shift | 0.0033 | 0.0004 | −87% |
| Page weight transferred | 1.06MB | 886KB | −18% |
| Requests | 199 | 179 | −10% |
| Loaded from other hosts | 412KB | 203KB | −51% |
| DOM elements | 510 | 365 | −28% |
| Deepest nesting level | 12 | 10 | −17% |
| Full page height | 2,358px | 2,485px | +5% |

### Contact
`/pages/contact`

Two fields and a message box became a real enquiry form — name, email, phone, subject, message — on a panel light enough to read, next to a map. Every colour pair on it was checked against WCAG before it shipped.

| Measure | Before | After | Change |
| --- | ---: | ---: | ---: |
| Time to first byte | 152ms | 50ms | −67% |
| First contentful paint | 444ms | 356ms | −20% |
| Largest contentful paint | 480ms | 356ms | −26% |
| Load complete [^contact1] | 1,028ms | 1,119ms | +9% |
| Cumulative layout shift | 0.0012 | 0.0005 | −58% |
| Page weight transferred | 969KB | 808KB | −17% |
| Requests | 194 | 179 | −8% |
| Loaded from other hosts | 412KB | 203KB | −51% |
| DOM elements | 528 | 375 | −29% |
| Deepest nesting level | 12 | 10 | −17% |
| Full page height [^contact2] | 1,449px | 1,987px | +37% |

[^contact1]: Slower, and the only page where that is true. The embedded map costs more than the removed scripts saved. It buys a shopper who can see where the bakery is; paint is still 20% faster, so the page is usable sooner even though it finishes later.
[^contact2]: Longer because the page gained a form worth filling in: phone, subject and a message field, plus the map.

---

## Beyond the numbers

Speed was the measurable part. Most of the work was not measurable, and some of it made
the numbers worse on purpose.

**What got better**

- **Reviews became real.** The old product page showed a dead five-star widget reading
  "No reviews". The new one embeds the store's actual Judge.me account — verified reviews
  render, a shopper can page through them and leave their own.
- **Fonts came in-house.** Google Fonts was a blocking third-party request on every page.
  Three self-hosted woff2 files, 42KB total, replaced it. One fewer host in the critical path.
- **Colour was calculated, not eyeballed.** Every text and control pair on the new panels
  was computed against WCAG before it shipped — the contact panel's field outline sits at
  55% opacity because 28% measured 1.89:1 and failed, and 55% is the first value that
  clears 3:1.
- **Structure got honest.** One `<h1>` per page across all sixteen routes; every image on
  the homepage carries alt text; the product page lost six levels of nesting.
- **Copy came out of the theme.** Dani's story and the contact details were stored in the
  old theme's settings, not in the page records — a theme swap would have blanked both
  pages. They were extracted verbatim first.

**What got worse, and why**

- **The homepage is taller and carries more elements.** It went from four sections to
  nine. A shopper who used to leave the homepage knowing nothing now passes the catalogue,
  the claims, the baker and the reviews on the way down.
- **The product page is slightly heavier.** Scripts dropped; photography grew, and the
  page now carries a working reviews widget it did not have at all. The wins there are
  layout shift and DOM size, not bytes.
- **The contact page picked up a long task.** That is the embedded map. It buys a shopper
  who can see where the bakery is.
- **Both versions still load around 150 scripts.** Almost all of it is Shopify apps and
  pixels, which live outside the theme. A theme rebuild cannot remove them; that is a
  separate conversation about which apps still earn their place.

---

## Deployment

The rebuild went live as a theme publish, not a migration. Products, orders, customers and
checkout are store data, not theme data, and were never touched. The previous theme stays
in the library, unpublished — a rollback is one call away.

Before publishing, a read-only check suite ran against the new theme: every route renders
without a Liquid error, add-to-cart works end to end, no stock theme markup leaks through,
every referenced asset resolves, one `<h1>` per page, every image has alt text. It ran
again against the live storefront after publishing. **89 checks, 0 failures.**

---

Design and build by [Switch Case Studio](https://switchcasestudio.com)
