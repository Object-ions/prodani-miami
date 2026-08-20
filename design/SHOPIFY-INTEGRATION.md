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

## Why I'd recommend option C here

**1. It makes the site's actual problem worse.** The audit found the storefront's
biggest weakness is JavaScript weight — 1,590 ms total blocking time on product pages,
14.4 s time-to-interactive, 354 requests. Adding a React runtime to a theme that is
already too heavy is pushing in the wrong direction.

**2. Nothing in this design needs React.** Going through it honestly:

| Feature | React version | Liquid + JS version |
|---|---|---|
| Category filter | `useState` + `AnimatePresence` | ~15 lines toggling a class |
| Cart drawer | Local state + spring | Shopify's own AJAX cart |
| Scroll reveals | `whileInView` | `IntersectionObserver` + CSS transition |
| Count-up stats | `requestAnimationFrame` hook | ~15 lines |
| Marquees | `motion.div` animate | `@keyframes translateX` |
| Card hover, tilt, squiggles, scalloped hem | CSS already | Same CSS, unchanged |

The visual design is plain CSS with custom properties and no framework, so **it ports
essentially verbatim.** The React in this repo is doing state management for a filter
and a cart — that's it.

**3. Scale doesn't justify it.** 27 SKUs, one collection page, one product template.
Shopify's own Dawn theme does everything above with web components and no framework.

## What I'd actually do

1. Keep `design/` as-is — it's the design artifact and doubles as the spec.
2. Port it to Liquid section-by-section. The CSS moves across almost unchanged; the
   JavaScript gets rewritten small.
3. Fold in the audit fixes at the same time (hero video, meta descriptions,
   `aggregateRating`, the `user-scalable=0` viewport tag).

If you'd rather have React in the theme anyway — for future app-like features, or
because a developer prefers it — option A is legitimate and I'll build it that way.
It's a preference call, not a correctness one. I'd just want the performance work done
first rather than after.
