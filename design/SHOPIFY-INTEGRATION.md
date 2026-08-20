# Can the store use React without going headless?

**Short answer: yes — React "islands" inside the existing Liquid theme.**
For this store, though, I'd recommend not doing it. Reasoning below.

## The three options

| | What it is | Headless? | Checkout | Theme editor | Apps (Judge.me) | SEO |
|---|---|---|---|---|---|---|
| **A. Liquid + React islands** | Keep the theme; mount React into specific sections | No | Native | Partial | Work | Fine |
| **B. Hydrogen / Oxygen** | Full React storefront on Shopify's stack | **Yes** | Rebuilt | Gone | Re-integrate | Needs work |
| **C. Liquid + light JS** | Port this design to Liquid; vanilla JS / web components | No | Native | Full | Work | Best |

Option B is what "headless" means, so it's out.

## How option A actually works

It's a real pattern, not a hack. In a Liquid section:

```liquid
<div id="pd-collection"
     data-products='{{ collection.products | json | escape }}'></div>
{{ 'pd-collection.js' | asset_url | script_tag }}
```

Build the React bundle with Vite to a single file, drop it in the theme's `assets/`,
and let it hydrate that div. The cart keeps posting to Shopify's AJAX endpoints
(`/cart/add.js`, `/cart.js`), and checkout stays entirely native. Nothing is headless —
Liquid still renders the page and Shopify still owns routing, cart and checkout.

**What it costs you:**

- The theme editor can't see inside a React component, so Dani loses drag-and-drop
  reordering and content editing for any section you convert.
- You ship React + Framer Motion (~45 KB gzipped, minimum) on top of the theme's
  existing JavaScript.
- Two build systems to keep in sync — Shopify CLI for the theme, Vite for the bundles.

## Revisiting the performance objection

My first take was "don't add React, the site is already too slow." Then I actually broke
down where the 1,590 ms of blocking time on the product page comes from, and that
objection doesn't hold up the way I stated it.

Main-thread time by script, product page (total scripted: **6,392 ms**):

| ms | Script | Can you cut it? |
|---:|---|---|
| 1,735 | Shopify `shop-js` (Shop Pay / Shop app) | Mostly no — platform |
| 1,376 | The document's own inline scripts | Partly |
| 1,207 | Unattributable | Partly |
| 529 | Judge.me reviews | **Yes** — lazy-load below the fold |
| 485 | Facebook Pixel (`fbevents` + `signals/config`) | **Yes** |
| 324 | Portable wallets | Only by dropping Shop Pay buttons |
| 272 | Shopify web-pixel-manager | No — platform |
| 137 | Theme `vendor.min.js` | Yes |

**The theme accounts for roughly 1,414 ms of 6,392 ms — about 22%.** The rest is
Shopify's own platform code and third-party apps. I was implicitly blaming the theme;
it isn't the theme.

So: **you're right.** Cutting the Pixel and lazy-loading Judge.me recovers on the order
of **1,000 ms**. React 18 + hydration of a 27-card grid costs roughly **200–400 ms** on
the mid-tier mobile Lighthouse emulates. You'd still be meaningfully ahead of today.

The nuance worth keeping: Shopify's own code sets a floor of roughly **2,500 ms** that no
amount of optimisation removes. That headroom you're about to win is finite and
hard-earned — spending a chunk of it is a legitimate choice, just not a free one.

**If you do go with React islands, drop Framer Motion.** It's the heavy half of this
prototype (~110 KB unminified, and it does layout work on the main thread). Every
animation in this design can be done with CSS transitions, `@keyframes` and
`IntersectionObserver`. React alone is ~45 KB gzipped; React + Framer Motion is roughly
double that for no visual gain.

## What actually decides it — and it isn't speed

Two costs survive the performance work entirely:

**1. The theme editor.** Any section converted to React becomes an opaque box in the
customizer. Dani can't reorder it, edit its copy, swap its images, or change its
settings without a developer. This is permanent and unrelated to page speed.

**2. Two build systems.** Shopify CLI for the theme, Vite for the bundles, kept in sync
forever.

So the real question is **who edits this site**. If Dani edits her own content, keep the
content sections in Liquid. If a developer always does it, islands are fine.

## The answer I'd actually give: do both

This splits cleanly, and it's not a compromise — it's the right shape:

| Section | Build as | Why |
|---|---|---|
| Product grid + filter | **React island** | Real state, real interaction, benefits from a framework |
| Cart drawer | **React island** (or Shopify's AJAX cart) | Genuinely app-like |
| Hero, story, reviews, footer, marquees | **Liquid** | Content Dani should be able to edit; zero JS needed |

You get React where it earns its place, Dani keeps the theme editor for everything she
actually touches, and the JS you ship is a fraction of hydrating the whole page.

## What I'd actually do

1. **Performance work first**, so the budget is measured on a clean baseline rather
   than guessed at: strip the Facebook Pixel, lazy-load Judge.me, defer the checkout
   bundles off browse pages, fix the 5.6 MB hero video.
2. Re-run Lighthouse. Now you know exactly what headroom you have.
3. Port the content sections to Liquid; build the grid and cart as React islands.
4. Fold in the remaining audit fixes (meta descriptions, `aggregateRating`, the
   `user-scalable=0` viewport tag).

Order matters mainly so you're deciding with real numbers instead of estimates — not
because React is dangerous.
