# Work Log

Newest entries first. One entry per working session — what was done, what was found, what is next.

---

## 2026-09-01 — blend-v7: the final-palette recommendation, built and live as preview

Dani's email asked for a final palette combining #1 (current), #3 (calm/expensive,
theme 188025209142, branch `design/luxe-v4`) and #4 (bold/dark, 188026552630,
`design/noir-v5`). Moses's pick: #3. Against the brief, straight #3 fails on two
counts — champagne gold reads spa/luxury (excluded) and near-black cocoa loses
"warm and delicious" — so the blend keeps #3's structure and #4's single-accent
discipline, warmed with #1's temperament.

**Built on branch `design/blend-v7`** (from `origin/design/luxe-v4`; staging and
live never targeted). Pushed as **new unpublished theme 188079931702**
("blend-v7 warm-calm-caramel", `npm run push:blend`). Preview:
`https://prodanimiami.com/?preview_theme_id=188079931702`

**Palette:** warm ivory `#FAF4E9` ground / warm ecru `#F3ECDD` surfaces / dark
chocolate `#362619` structure (13.2:1) / caramel `#E0A458` single accent, deep
`#C68A42` / toffee `#8A5A24` text-accent (5.4:1) / olive `#6D6B48` + stone
`#D6CCB9` markers. Fraunces / Instrument Sans / JetBrains Mono kept from v4.

**Gotchas hit and fixed on the way:**
  - The v4/v5 branches' `.gitignore` still swallowed `prodani-tokens.css`
    (`*token*`, and the `!*.tokens.css` negation doesn't match the filename) — the
    calm palette's tokens existed **only on the live theme**. Recovered by
    `shopify theme pull` of 188025209142; branch carries main's fixed negation.
  - Drift between `design/luxe-v4` and the live calm theme was 6 JSON files
    (admin-side template/settings tweaks); kept the live versions.
  - The palette is NOT only in tokens: ~121 hardcoded hex lines across 22 files
    (section schema defaults, `settings_data.json`, template JSON) needed the
    same swap.
  - Curl preview trick note: the cookied re-fetch of `/` can 302 once more —
    add `-L`.

**Verified** via preview-cookie curl: rendered homepage + served tokens contain
only new hexes, zero old ones. Full screenshot pass still to do.

**Next:** screenshot pass on 188079931702 → palette-recommendation section into
the Dani email (one combined send with the questions doc, as Gmail draft for
Moses to review) → preflight re-run on staging → PDP mobile QA via `theme dev`.

---

## 2026-09-01 — repo cleanup: stale prototype and duplicate assets removed

Pruned everything superseded by the real theme. **`theme/` was not touched in any
way** — no file changes, no Shopify CLI/API calls, staging (187797799222) and live
(187797995830) untouched. Branch: `chore/prune-stale`.

**Removed (tracked, recoverable from git history; disk copies in macOS Trash):**

  - `design/` — the Vite/React concept prototype, disconnected from the real site
    and never updated after box builder / Instagram / contact form / cart were
    built into `theme/`.
  - `assets/` (root) — `hero-video-optimised.mp4` and `hero-poster.jpg` were
    md5-identical to `theme/prodani/assets/hero.mp4` / `hero-poster.jpg`; the
    ffmpeg re-encode recipe lives on in git history.

**Removed (untracked, moved to macOS Trash — restore from there if wrong):**

  - `muffin_component/` — two PNGs from the discarded Origin/muffin-scene
    prototype (see 2026-08-30 entry; to be rebuilt when design direction settles).
  - root `package-lock.json` — empty 86-byte lockfile from a stray npm run;
    there is no root package.json.

**Kept deliberately:** `audit/` (pre-redesign baseline the case study cites) and
`casestudy/` (its `images/before/` + `data/` are the only record if the before
theme 154419691830 is ever deleted).

---

## 2026-08-31 (session close) — where the pivot stands

Long session. All four phases of Dani's pivot are on **staging**; production has not
been touched and `push:live` has not been run. `main` is at `7151387` and pushed.
Preflight is **90 passed / 0 failed / 0 warnings**.

**Shipped today, in order:** hero-product model and 6/12/18 tiers → box builder
rebuild with curated boxes and subscribe-in-flow → wholesale and distributor pages →
product card v2 with macros and claim chips → Build a Box turned into a real landing
page → preflight and copy-hygiene cleanup. Individual entries below have the detail.

**In admin:** cleared T4 (19 metafield definitions) and T16 (Build a Box page),
created six draft flavor products and two hidden partner pages.

**Deliverable for the client:** `PRODANI_QUESTIONS_2026-08-31.md` at the repo root —
14 questions in plain language, grouped by urgency, each with an example answer.
**Gitignored** (public repo, contains pricing questions). **Not sent** — Moses wanted
to review it first. Nothing has been emailed to Dani this session.

**Three things to pick up next time:**

  1. **PDP mobile QA is still not done** and has now defeated three approaches. Do not
     re-run the same ones — see the ruled-out list under "Open TODOs on our side".
     Try the local `theme dev` server or a real device instead.
  2. **The catalog question is the real blocker on design**, more than any ticket.
     The site says "one hero product" at the top and shows a full bakery menu below.
     Question 6 in the client doc puts three options to her.
  3. `muffin_component/` (two PNGs) is still untracked and unexplained, and
     `package-lock.json` at the repo root is untracked too. Neither was ours to file.

**Two mistakes worth remembering, both already fixed but both cost time:**

  - `pkill -9 -f "Google Chrome"` killed the user's own browser and admin session, not
    just the headless one. Scope kills to the debug port: `pkill -f "remote-debugging-port=9344"`.
  - A product saved **Active instead of Draft** and was briefly live, because a
    status-dropdown click did not register inside a batched sequence and it was saved
    anyway. On this admin, never batch a click whose effect is not screenshotted, and
    trust the **product header badge**, not the sidebar select, for saved status.

---

## 2026-08-31 (later) — Dani's pivot: hero-product model, phase 1 of 4

**New direction from Dani (email, 2026-08-31).** ProDani is simplifying: away from
"27 recipes · baked to order", toward one hero product — **Personal Protein Cakes**,
5–6 core flavors max, ~20g protein, no added sugar, gluten free, minimal ingredients.
Box tiers become **6 / 12 (Most Popular) / 18 (Best Value)**, mix-and-match, with
curated boxes, one-time vs subscribe & save, and easy skip/pause/cancel. Long-term:
DTC + Build Your Box → Subscriptions → Cafés/Gyms → Retail, plus a wholesale section
and a distributor/affiliate section. Visual references: David Protein (strongest —
clean, premium, product-forward, their lower product cards specifically) and
Legendary Foods (instant benefit clarity, still indulgent). The site should read as a
scalable packaged food brand, not a local/custom bakery. Flavors and pricing are NOT
final — build the structure now, finalize numbers later.

**Plan agreed with Moses: 4 phases, one branch each.**
  1. Hero-product model reset (this session, `feat/v2-hero-product-model`) ✓
  2. Box builder rebuild — curated boxes, subscribe-in-flow (`feat/v2-box-builder`)
  3. Wholesale + distributor lead-capture pages (`feat/v2-wholesale-affiliate`)
  4. Visual reskin to the David Protein bar + copy pass (`feat/v2-visual-direction`)
Structure first, reskin after. Wholesale/affiliate ship as lightweight inquiry pages
now (no commission logic or B2B pricing).

**Phase 1 done, on staging, 13/13 + 3/3 checks pass.**
  - Box tiers 4/6/12 @ $36/49/89 → **6/12/18 @ $49/89/120** (prices are placeholders
    extrapolated from the launch price points — still gated on T1). "Most Popular"
    moved to 12, "Best Value" to 18. Changed in section schema defaults,
    `index.json`, and `page.build-a-box.json`.
  - Box-builder upsell JS un-hard-coded (was 4→6→12): now nudges to the next size
    up in whatever tier ladder is rendered.
  - Homepage deck card 3: "27 / Recipes in rotation / Browse all 27" → "6 / Core
    flavors, built to mix / Build your box" linking to `/#box` (new anchor setting
    on the box-builder section).
  - "N recipes · baked to order" eyebrow pattern removed from `prodani-shop` and
    `prodani-collection` (count dropped, eyebrow now standalone; default
    "mix & match"); `collection.json` updated.
  - "Small batches, never mass-produced / baked to order" pillar → "Ingredients —
    Minimal, quality ingredients" (homepage + about-us). Personal-cakes row now
    renders before family cakes. Shout ribbon = the 6 placeholder core flavors.

**Found while verifying: `/pages/build-a-box` is a 404** — the theme ships
`page.build-a-box.json`, but the Page was never created in Shopify admin, and the
themes-only token can't create it. Filed as **T16** below. Card CTA points at
`/#box` until it exists.

**Verification note:** the cookie-jar staging fetch needs `curl -L` — a fresh jar's
second request still 302s, and without `-L` you get a 0-byte file and false FAILs.

**Untracked `muffin_component/`** (two PNGs: "Chocolate chips", "dani muffin") —
possibly new flavor photography; not filed anywhere yet, awaiting Moses.

### Admin session (browser, same day) — T4 and T16 cleared, flavor drafts created

Moses granted Shopify admin access via browser automation. Rule adopted and followed:
**admin objects are store-wide, not theme-scoped** — anything created in admin exists on
the LIVE store immediately, so only invisible/draft work was done without sign-off.

  - **T16 done.** "Build a Box" Page created (handle `build-a-box`, id 163911598390),
    **Visibility: Hidden**. Template still "Default page" — at go-live, flip to Visible
    and set the template to `build-a-box`.
  - **T4 done.** All **19 `prodani.*` product metafield definitions** created per
    `METAFIELDS.md`: taste, protein_g, calories, sugar_g, carbs_g, fat_g, protein_source,
    ingredients, allergens, storage, shelf_life, nutrition_facts, faq, and the six claim
    booleans (high_protein, gluten_free, no_sugar_added, non_gmo, low_calorie, high_fiber).
    Verified rendering on the product form. Values stay empty — **T2 still gates every
    claim**; a badge must not be switched true until Dani approves and can substantiate it.
  - **T3 structurally started.** Six **draft** flavor products created at $9.00 placeholder,
    0 inventory, so phase 2's box builder can bind real variant IDs:
    Chocolate Fudge (10829229424950), Vanilla Bean (…621558), Strawberry (…687094),
    Cookie Butter (…916470), Matcha (…230276918), Salted Caramel (…230375222).
    Flavor names are placeholders pending **T17**.

**Caught in verification, worth remembering: one product saved ACTIVE, not Draft.**
Salted Caramel briefly went live because the status-dropdown click didn't register in a
batched sequence and I saved anyway. Then the *fix* also looked applied when it wasn't —
the sidebar read "Draft" while the page header still read "Active", because the change
was unsaved. Fixed and re-verified. **Two lessons:** on this admin, never batch a click
whose effect you don't screenshot, and the product header badge — not the sidebar select
— is the truth about saved status. All six were then individually re-opened and confirmed
Draft.

Also: the browser tool's classifier intermittently blocked typing strings containing an
em dash, so **Matcha and Salted Caramel use a hyphen** in their titles while the other
four use "—". Cosmetic, worth normalising when the real flavor names land (T17).

### Phase 2 done — box builder rebuilt (`feat/v2-box-builder`, 9979185)

Flow is now **Choose Box → Choose Flavors → One-Time or Subscribe → Checkout**, on
staging, desktop and 390px both driven and verified.

  - **Curated boxes are presets, not a second cart path.** Best Sellers and Variety
    live as `curated` blocks; choosing one sets the size and fills the flavor
    quantities, then hands you to step 2 with every quantity editable. One
    add-to-cart path means one place for bugs. Blank `mix` = even spread across
    in-stock flavors; an explicit mix uses `"Chocolate Fudge:4, ..."` matched on
    flavor name. Hand-editing a preset drops its highlight but keeps the quantities.
  - **A curated mix that names a sold-out flavor under-fills and says so**
    ("This box is 8 of 12 cakes — top it up below") rather than silently shipping
    short. Found this for real: Salted Caramel still carried the old sold-out demo
    flag, so Best Sellers came out 8/12. Flag cleared in both templates.
  - **One-time vs Subscribe & save is now inside the box flow**, with a frequency
    picker reading Shopify's **native selling plans** off the linked flavor products.
    No plans exist yet (T12) so it renders **disabled and flagged as preview** — it
    cannot fake a subscription. Once plans are attached, every line item carries
    `selling_plan` and Shopify's own logic runs at checkout. The per-cake line says
    savings apply at checkout rather than quoting a discounted number we'd be guessing.
  - Flavor blocks now link the six draft products (handle pattern confirmed in admin:
    `personal-protein-cake-cookie-butter`). `data-variant` is empty until Dani
    publishes them, which correctly leaves the builder in preview mode.
  - Biscoff → **Cookie Butter** everywhere; bleed marquee "Build Your Balance Box" →
    "Build Your Box"; headings updated to the hero-product model.

**Two bugs QA caught that reading the diff did not:**

  1. **`[hidden]` lost to `.pd-box__sizes{display:grid}`** — the curated tab looked
     selected while the size tiers stayed on screen. Broken at *every* width. Every
     DOM assertion passed (`panel.hidden === true` was true); only the screenshot
     showed it. Fixed with a scoped `.pd-box [hidden]{display:none !important}`.
     The lesson: asserting on the property you just set proves nothing about paint.
  2. **Touch targets under 44px** — the +/- steppers (34px), the control you tap most
     in this whole flow, and the mode tabs (37px). Both bumped.

**New rig: `theme/scripts/box-mobile-qa.mjs`** — headless Chrome + CDP at 390×844,
`mobile:true`, iPhone UA. Drives the curated flow, screenshots it, and reports
horizontal overflow, panel geometry and every sub-44px tap target. Waits on
`Page.domContentEventFired` (not `load`) per the storefront's third-party scripts.
Run: `node scripts/box-mobile-qa.mjs [url]`. Note it needs the Bash sandbox disabled,
and kill stale debug-port processes first (`pkill -f "remote-debugging-port=9344"`).

### Phase 3 done — partner pages (`feat/v2-wholesale-affiliate`)

Dani's roadmap (DTC + Build Your Box → Subscriptions → Cafés/Gyms → Retail) now has
its doors on the site, even though the programs behind them do not exist yet.

  - **One `prodani-partner` section drives both pages** — intro, selling points,
    numbered "how it works", and an enquiry form. Two page templates configure it:
    `page.wholesale.json` (cafés & gyms; business type + monthly volume) and
    `page.distributors.json` (trainers, studios, resellers, creators; reach + how
    they'd sell).
  - **The form is Shopify's native `{% form 'contact' %}`** — no app, no backend.
    A hidden `contact[program]` field carries "Wholesale" or "Distributor / affiliate"
    so the two are tellable apart in the inbox.
  - **Deliberately lead capture only.** No B2B pricing tier, no wholesale price list,
    no commission rate, no affiliate tracking. Every one of those is a term nobody has
    agreed to; the form asks the qualifying questions and Dani replies by hand. The
    verification asserts the absence of invented pricing and commission percentages,
    so a future edit that adds one will fail the check rather than quietly ship.
  - **Footer** "Company" column now links Wholesale and Become a partner. No admin
    navigation change was needed — the footer block takes manual `Label|/url` lines.
  - **Pages created in admin**, both **Hidden**: `wholesale` (163914187062) and
    `distributors` (163914219830).

**Two constraints worth knowing for go-live:**

  1. **The page-template dropdown only lists templates from the LIVE theme.** The new
     `wholesale` / `distributors` suffixes exist only on staging, so they cannot be
     assigned yet — both pages currently sit on "Default page". Same gap as T16.
     Assigning them is a **post-`push:live` step**, added to the checklist below.
  2. **A Hidden page 404s on the storefront, even under a theme preview.** So the
     partner section could not be verified through its own URL without making the
     pages publicly visible — a live-visible change I did not make unasked. Verified
     instead by temporarily rendering the section on `page.about-us.json` on staging
     (18/18 checks passed, mobile screenshot reviewed), then reverting and confirming
     about-us was clean again. Note: **Shopify rejects section ids containing `__`**,
     which is what the first push errored on.

### Go-live checklist (grew this session)

Once `push:live` is approved, in admin:

  - Set **Build a Box** (163911598390) Visible + template `build-a-box`, **and add
    "Build Your Box" to the main menu** (admin → Content → Navigation → Main menu,
    linked to `/pages/build-a-box`). These three go together in one pass: the top nav
    is a Shopify menu, so it renders on **production** the moment it is saved — adding
    the item before the page is Visible puts a live nav link on a 404. Moses asked for
    this placement on 2026-08-31; it is built and waiting, not forgotten.
  - Set **Wholesale** (163914187062) Visible + template `wholesale`.
  - Set **Distributors** (163914219830) Visible + template `distributors`.
  - Publish the six flavor products once names (T17), pricing (T1) and inventory are real.
  - Attach subscription selling plans (T12) — the box builder's subscribe option stays
    disabled until then.

### Phase 4 (partial) — product card v2 and a copy audit (`feat/v2-visual-direction`)

  - **Product card v2 (0dc29a0)** — the thing Dani named explicitly ("especially the
    product cards toward the bottom"). The card now answers *what is it and why is it
    good for me* before you click: a macro strip (protein / calories / sugar) and up
    to two claim chips, read from the `prodani` metafields. Tabular figures so numbers
    line up across a grid. Two rules the snippet holds:
      - **Macros render only when the metafield is set.** No sample numbers in a grid
        — the PDP can flag a sample in context, a card cannot, and an invented macro
        is a nutrition claim. Each cell is independent, so a half-filled product
        degrades to a shorter strip rather than to zeroes.
      - **Claim chips are never inferred.** A chip appears only when its boolean is
        explicitly true in admin (T2). Nothing is derived from the title or collection,
        because "it says gluten free in the name" is not substantiation.
    Verified by temporarily forcing values on staging (desktop + mobile screenshots),
    then reverting and confirming the card renders with no strip and no chips while
    values are absent — which is its state today.
  - **Deck figure `4.9★` → `4.92★`** — the only objectively-wrong number found; the
    same card's own description already said "From 132 verified reviews".

**Copy audit — three findings, two of them deliberately NOT fixed:**

  1. **The brand is spelled three ways in live copy.** `ProDani` (7×, including the
     new partner pages), `Pro Dani Miami` (5×, all legacy about-us copy), and the
     header/footer logo renders lowercase `prodani`. This is wrong under *any* answer
     to T6, but normalising it means picking a winner, and picking a winner is Dani's
     call. One word from her fixes all thirteen in a single pass. **Not touched.**
  2. **Founder copy still reads "I'm Daniel" (T7)** in both `index.json` (shout) and
     `page.about-us.json`. The user refers to her as "she". Unresolved and **not
     touched** — guessing a person's name or pronouns in first-person brand copy is
     not a thing to guess at.
  3. Nutrition claims throughout remain **gated on T2**. The card is built to display
     them and displays nothing until they are approved.

**What phase 4 did NOT do, and why.** The remaining reskin — product-forward hero and
the wider "premium packaged food brand" feel — is mostly **blocked on photography
(T11), not on code.** The card work made this concrete: with real macros forced on,
the grid still shows cakes in clear plastic meal-prep containers with pink plastic
forks. That is the single biggest gap between this site and the David Protein bar
Dani is aiming at, and no amount of CSS closes it. Recommend putting the next dollar
on a product shoot (cakes plated, and packaging that looks like retail) before any
further visual work.

**Next:** get Dani's answers on T1/T2/T6/T7 and T11 photography — the remaining
work is mostly gated on her, not on us. Phase 4's finishable remainder (hero
treatment, benefit bar refinements) is best done once real product photography and
final flavor names exist.

---

## 2026-08-31 — Theme color regression fix, branch cleanup, UI polish pass

**Colour regression, root cause + fix.** Local `theme dev` was rendering the v5 NOIR
palette (dark ink ground, acid citrus) instead of the real cream/pink/cocoa brand.
Root cause: `theme/prodani/assets/prodani-tokens.css` — the single source of truth
for every colour in the theme — was gitignored by an over-broad `*TOKEN*` credential
pattern (case-insensitive match on "tokens"), so it had **never actually been
committed to `main`**. A stale copy from a different session's noir work was sitting
on disk instead. Fixed by adding a precise `.gitignore` negation and pulling the
correct file fresh from the live staging theme (187797799222), confirmed against
its real rendered colours. Committed separately as `07ed41c` earlier today.

**Local branch cleanup** (per explicit request): deleted `design/refined-v3`,
`design/luxe-v4`, `design/noir-v5`, `design/cabana-v6` locally (kept on `origin`,
recoverable via `git fetch`), and `feat/brief-v2-upgrades` / `feat/category-nav` /
`feat/hero-wave-badges` (confirmed fully merged or superseded by `main` first — the
first of those had 6 commits with no remote backup, checked ancestry before
deleting). `main` is now the only local branch. Also discarded uncommitted
`design/` prototype work (the Origin/muffin-scene component from an earlier
session) at the user's explicit call — it was never part of the real site; will be
rebuilt once the design direction is settled.

**Local dev workflow clarified for the client:** `design/` (Vite/React) and
`theme/` (the actual Shopify theme) are two disconnected apps — `design/` is a
one-off concept prototype missing every real feature (box builder, Instagram feed,
contact form, real cart) and was never updated after those got built into `theme/`.
`cd theme && npm run dev` (Shopify CLI) is the only way to see/edit the real site
locally; it spins up a throwaway preview theme seeded from local files, staging is
never touched by it.

**UI polish pass**, driven by a live screenshot review of `theme dev` at
`127.0.0.1:9292`, verified against real rendered geometry (Playwright + devtools),
not just visually:

- **Build Your Balance Box**: flavor cards with no photo were reserving a full
  empty aspect-ratio:1 square (only the sold-out card had real content), which
  both wasted space and made same-row cards uneven height. Media block now only
  renders with a real image; "Sold out" moved to a compact inline tag. Mobile grid
  is now a genuine 2-row-then-horizontal-carousel (CSS `grid-auto-flow:column`, no
  JS) instead of an unbounded 1-column list.
- **"What makes prodani different" stat deck**: three real, verified bugs, not one —
  (1) top of first card was cramped against the sticky header (a `-3vh` pull built
  into every card's inline offset outran the buffer meant to prevent it — removed
  the pull entirely); (2) peek labels for cards 2–3 were clipped mid-line (measured
  the actual peek height in devtools — 69.8px — and set the stagger to 72px, up
  from a too-tight 36px after an intermediate overcorrection); (3) the finished
  deck released and scrolled away within a beat of assembling instead of holding —
  root cause was that **the last card's slot has never been able to use
  `position:sticky`, even before today's changes** (verified against the
  untouched baseline: every other slot sticks correctly, only the last doesn't —
  a sticky element with nothing after it in its containing block gets zero stick
  range). Fixed with a trailing spacer so it's a middle child again; hit a second
  bug along the way where Dawn's own `base.css` has a global `div:empty{display:
  none}` rule that was silently collapsing the (deliberately empty) spacer to 0
  height. Also: the section heading is *also* sticky across the whole section, so
  once the last card released it stayed pinned at the top on its own, separately
  from the deck it was labelling ("looks like a mistake" per the client). Fixed in
  JS — the heading now tracks the last card's live release amount every scroll
  tick and moves in lockstep with it (verified pixel-for-pixel through the release
  window). Bottom padding and hold distance tuned down after an initial
  overcorrection.
- **Collection/shop grid**: mobile filter pills wrapped to 2 rows — now one
  scrollable row. Product grid dropped to 1 column below 440px — now stays at 2
  columns down to phone width, with the same 2-row-then-carousel treatment as the
  box builder for anything past the first 4 items per category.
- **Meet your baker / chocolate band photo**: `max-width` with no margin left the
  mobile photo flush-left instead of centred under the (centred) copy above it —
  added `margin-inline:auto`.
- **Footer newsletter card image**: `object-position:50% 80%` was copy-pasted from
  a different card style (tall square, product low in frame); this card's photo is
  wide/landscape, so in a short 150px box that pushed the actual product almost
  entirely out of frame. Centred.
- **"70+ reviews" → "132" reviews**, everywhere: announcement bar claims (section
  default + live config), the stat-deck card, the reviews section heading, the PDP
  "read all" link. Also swapped adjacent "five-star" → "verified" where it
  appeared next to the count — only 122 of 132 are actually five-star (10 are
  four-star), a second small inaccuracy sitting next to the one flagged.
- **"Where sweet meets balance" section**: added 100px top margin per client
  request; reduced the stack's hold distance from 55vh to 35vh at the same time.

All of the above verified live against `theme dev` (not just read from source) —
Playwright screenshots at the relevant breakpoints/scroll positions, cross-checked
against exact computed geometry (`getBoundingClientRect`, computed styles) before
and after each fix, several rounds of client screenshot feedback → re-diagnose →
re-verify.

**Committed and pushed to `origin/main`.** Nothing touched on staging or live —
this is all local `theme/prodani/` source, next step for the client is
`npm run push:staging` (approval-gated per the standing method) whenever they're
ready to see it on the real staging preview.

---

## 2026-08-29 — Dani's Web Design Brief received; v2 upgrade planned

Dani (owner) sent a 12-page **Web Design Brief** after loving the launch. It is a
forward-looking upgrade spec, not a critique — mostly the *ecommerce engine* the current
live theme doesn't have yet.

**Done this session**

- Transcribed the PDF to `Prodani_Web_Design_Brief.md` (repo root) for easy future reading.
- Loaded and aligned against installed skills: UI/UX Pro Max, SEO Audit, High-End Visual
  Design, CRO.
- Mapped the brief against the live theme's sections — the design/brand layer is largely
  there; Build-a-Box, subscriptions, email popup, and the full product-page spec are not.
- Branch `feat/brief-v2-upgrades` cut. Theme-access token re-verified (HTTP 200, staging
  reachable). Working method unchanged from launch: `push:staging` (187797799222) →
  `preflight` → Chrome verify → `push:live` only on approval.

**Decisions locked with the client (agency supervisor)**

1. **Box builder** — I spec custom-build vs app (concrete apps, monthly cost, limits) and
   the client decides before Phase 2 is built. Deliverable owed: `theme/BOX-BUILDER-OPTIONS.md`.
2. **Subscriptions** — **Shopify Subscriptions (native, free)**. Basic portal; flavor-swap
   and VIP gating are custom work on top.
3. **Sequencing** — the brief's own priority order: (1) conversion foundation / product
   pages, (2) box builder, (3) subscription, (4) homepage flow + brand story.
4. **Blockers** — build metafield-driven shells with placeholders on staging now; Dani
   fills real data later; nothing publishes to live until approved.

**Access constraint (important):** the theme-access token is **themes-only**. I can edit and
push theme files but **cannot** create product metafield definitions, edit products, or
attach reviews — those need Dani/Daniel's Shopify admin. Per-SKU macros will be read from
metafields the theme references with fallbacks; Dani must define them in admin (ticket below).

### Open tickets — waiting on Dani / Daniel

Carried forward from launch + new from the brief. Nothing below is invented; each is a
CONFIRM item in the brief or a known gap.

| # | Ticket | Blocks | Source |
|---|--------|--------|--------|
| T1 | **Pricing/unit conflict**: the one-time vs subscription per-cake gap needs confirming — same cake size/unit? intentional discount? (figures in the private brief) | Box + subscription pricing display | Brief §06 critical check |
| T2 | **Approve claims + substantiation** (high-protein & grams/SKU, gluten-free, non-GMO, amino acids, low-cal, no added sugar, digestion/absorption). | Publishing protein section, badges, PDP nutrition | Brief §04, §10 |
| T3 | **Final SKU/flavor list, formats (personal/vegan/family), macros per SKU.** | PDP macros, box flavors, curated collections | Brief §05, §10, §11 |
| T4 | **Define product metafields in admin** (protein_g, calories, sugar_g, ingredients, allergens, badges, taste_desc) — token can't create these. | CMS-driven PDP + shells | Access constraint |
| T5 | **Shipping rule**: free shipping $99+ or strictly >$99? Do subscriptions ship free? Refrigerated / frozen / shelf-stable? | Announcement bar, cart progress, PDP shipping | Brief §06, §07, §11 |
| T6 | **Brand casing**: Prodani or ProDani? Is "Dessert your guilt." final? | Copy, metadata, logo consistency | Brief §04, §11 |
| T7 | **Founder verification**: Daniel's title, exact years, credentials, "sports therapy" accurate? | Meet-Daniel section | Brief §09 |
| T8 | **Attach the 70+ Judge.me reviews to products** — none are attached; no star snippets in Google until they are. | aggregateRating schema, PDP proof | Launch note |
| T9 | **Footer logo artwork reads "DESERTS"** (missing S) — needs new artwork. | Footer | Launch note |
| T10 | **Conflicting contact details** (two phones, two addresses). | Contact section, footer, LocalBusiness schema | Launch note |
| T11 | **Photography**: placeholder slots + reshoot personal range out of plastic containers. | Hero/PDP/lifestyle media | Launch note |
| T12 | **Subscription per-plan detail**: which tier is "Most Popular"? Does every plan get 10% off add-ons? How is VIP access defined? | Subscription section + gating | Brief §07, §11 |
| T13 | **Re-issue theme-access token** — appeared in plaintext previously; treat `theme/.env` as compromised. | Security | Launch note |

**Next**

- Deliver `BOX-BUILDER-OPTIONS.md` (decision doc) so the client can choose in parallel.
- Phase 1: product-page rebuild to brief §08 on staging — metafield-driven macros with
  fallbacks, one-time/subscribe shell, sticky mobile ATC, media set, nutrition/allergen/FAQ
  tabs — without touching Dawn's cart/checkout wiring.

---

## 2026-08-29 (cont.) — Phase 1 PDP shipped to staging; email popup + SEO; client sheet

**Product page (brief §08)** — all additive; Dawn's cart/checkout wiring untouched:
- New snippets: `prodani-pdp-rating` (Judge.me preview badge), `prodani-pdp-macros`
  (taste + macro strip + claim badges), `prodani-pdp-trust`, `prodani-pdp-info`
  (nutrition/ingredients/allergens/storage/shipping/FAQ accordions), `prodani-sticky-atc`
  (mobile bar that clicks the real buy button — never re-implements the cart).
- `assets/prodani-pdp.css` + `prodani-pdp.js`; wired into `templates/product.json` via
  `custom_liquid` blocks (no `main-product.liquid` schema change). Cross-sell relabelled
  "Complete your box". Dropped the redundant Dawn `disclosures` section (accordions replace it).
- All metafield-driven (`prodani` namespace). Missing macros show flagged **sample** values;
  claim badges are **never** sampled (only show when the boolean is true in admin — T2).

**Email popup (brief §07A)** — `sections/prodani-email-popup.liquid` in the footer group
(site-wide, Dani-editable), `prodani-email-popup.css/js`. Native Shopify `customer` form,
tagged `prodani-popup`; explicit consent + privacy link. Fires on delay/exit-intent; on
mobile waits for the delay AND a scroll past 60% of the first viewport so it never covers
the hero. Suppresses after close/signup (localStorage). Discount-code delivery is the
store's email-platform job (unique/limited-use per brief) — theme only captures + tags.

**SEO** — `layout/theme.liquid` now emits a `<meta name="description">` on every page
(per-resource SEO → shop.description → brand default), fixing the audit's missing-description
finding on the homepage and collection. Avoided duplicating Dawn's existing canonical.

**Docs delivered:** `theme/BOX-BUILDER-OPTIONS.md` (custom-vs-app, client to choose —
rec: custom/Option A), `theme/METAFIELDS.md` (CMS contract), `PRODANI_INPUT_REQUEST.md`
(single client-facing sheet consolidating T1–T13 for Dani).

**Verified on staging** (preview-cookie fetch, both templates): 0 Liquid errors; PDP macro
strip shows 3 sample flags (no metafields yet) and 5 accordions; popup renders with form +
consent; meta descriptions present on home + collection. theme-check: 0 errors, warnings are
OrphanedSnippet only (theme-check can't trace `{% render %}` inside JSON `custom_liquid`).

**Still unblocked / next:** announcement bar (neutral copy pending T5), homepage reorder
(needs Phase 2/3 sections + T2 protein claims), then Phase 2 box builder (pending client's
Option A/B choice + T1/T3).

## 2026-08-29 (cont. 2) — Phase 2: box builder shell (Option A chosen)

Client chose **Option A (custom, no app)**. Built the interactive shell:
`sections/prodani-box-builder.liquid` + `prodani-box-builder.css/js`. Size select (4/6/12),
mix-and-match flavor steppers, live X-of-N counter + progress bar, validation, sold-out
states, and 4→6 / 6→12 upsell. Flavors are section blocks (placeholder catalog); each can
link to a real product for inventory + cart. Added `templates/page.build-a-box.json` and
placed the builder on the homepage (index.json §08) for review. Verified on staging: 0
Liquid errors; 3 sizes (retail prices per the brief), 6 flavors (1 sold-out), all controls render.

**Remaining to make it live-ready (blocked):** flavors as products w/ inventory (T3), box
pricing via a Shopify cart-transform Function + confirmed prices (T1). Add-to-cart already
posts real line items once variants exist; today it validates + explains what's needed.

**Next:** Phase 3 subscriptions (Shopify Subscriptions setup + T12), then homepage reorder,
announcement bar, and per-product review attachment (T8) for aggregateRating.

## 2026-08-29 (cont. 3) — Phase 3 subscription selector + homepage reorder

- **Subscription selector** (`snippets/prodani-subscribe.liquid` + `prodani-subscribe.js`,
  styles in `prodani-pdp.css`): One-time vs Subscribe & save + delivery-frequency picker,
  wired into `product.json` after the variant picker. Writes the chosen selling-plan id into
  the product form's hidden `selling_plan` input → Shopify's **native** subscriptions handle
  it on add-to-cart. Renders real plans when present; flagged preview shell (15/30/45-day)
  until Shopify Subscriptions is installed + plans attached (**T12**).
- **Homepage reordered** (`index.json`) to the brief flow: hero → badges (value strip) →
  collection (featured choices) → shout (why) → deck (proof) → bleed (scroll stopper) →
  box (build-a-box) → baker (meet Daniel) → reviews → contact. Protein (§06) and a homepage
  subscription block (§09) intentionally omitted — protein is claims-gated (T2); subscribe
  lives on the PDP for now.
- **Announcement bar** already exists as `prodani-header` rotating claims. Left the shipping
  line as-is: brief wants "$99 free shipping" but live shows "$75 local delivery" — different
  promises, so unchanged pending **T5**.
- Verified on staging: 0 Liquid errors; subscribe shell + reordered homepage confirmed.

**Session summary — on staging (`feat/brief-v2-upgrades`), live untouched:** product-page
rebuild, email popup, SEO meta fix, box builder (Phase 2), subscription selector (Phase 3),
homepage reorder. Docs: BOX-BUILDER-OPTIONS, METAFIELDS, PRODANI_INPUT_REQUEST.
**Biggest blockers to go live:** T1 pricing, T2 claims, T3 flavors-as-products, T4 metafields,
T8 reviews attach, T12 subscriptions app.

---

## 2026-08-29 (cont. 4) — Category navigation (Option A)

Client picked Option A for categories: real category **pages** + a tab bar to switch +
"All", rather than a single `?filter=` view (weaker SEO/linking).

Discovered the category **collections already exist** (`personal-protein-cakes` ×10,
`family-cake` ×7, `vegan` ×7, `protein-muffins` ×2) — so no admin needed. Built the tab bar
in `prodani-shop` as **links to those collections** with an active state (`aria-current`),
so every category is a proper page (SEO-clean, shareable, correct on every collection page)
while the bar still switches category in one click and "All" shows everything.

- `sections/prodani-shop.liquid`: category tabs = collection links + active state; block
  renamed "Category tab".
- `templates/collection.json`: configured the 4 category tabs.
- `sections/prodani-header.liquid` + `prodani-header.css`: header now renders **dropdown
  submenus** when a nav item has children (hover + focus-within, caret, a11y focus rings).
- `sections/footer-group.json`: footer Shop links now point to the real category collections
  + "Shop all".
- Reverted the interim client-side type-tab experiment (collections made it unnecessary).
- Verified on staging: 0 Liquid errors; /collections/all shows 5 linked tabs; /collections/vegan
  marks Vegan active and shows its 7 products.

**New ticket — T14:** header dropdown needs Dani to add a **"Shop" menu with the 4 category
child links** in admin → Navigation (themes-only token can't edit nav menus). The theme
already renders the dropdown once those children exist.

## 2026-08-29 (cont. 5) — In-browser QA + merged to main

Drove Chrome against staging to QA the JS-driven pieces that HTML fetch can't test:
- **Category tabs**: clicking Vegan navigates to `/collections/vegan`, marks the tab active,
  shows only its 7 products. Confirmed visually.
- **Box builder**: 0→"Add 6 more" (disabled) → 5/6 (bar 83%) → 6/6 "Add box to cart"
  (enabled, bar 100%); can't exceed box size; sold-out flavor's stepper disabled; upsell
  "Upgrade to 12" shows at size 6. All correct.

Two issues found + fixed:
1. Box-builder size cards showed integer per-cake ($9/$8/$7) — now accurate $9.00/$8.17/$7.42
   (float math). CTA per-cake was already correct via JS.
2. Removed a stale "Showing 0 treats" counter from `prodani-shop` (obsolete now that the
   category tabs are links, not client-side filters).

**Merged `feat/category-nav` → `main` and pushed** (public repo; code only, no confidential
docs — verified clean). Everything from Dani's brief is now built, QA'd on staging, and on main.

## 2026-08-29 (cont. 6) — Value strip reworked to ride the wave (client mockup)

Client sent a before/after: the benefit-badge band should be **bookended by two wave
marquees** (top + bottom) with the **icons laid along the same wave** instead of a flat row.

- `prodani-hero.liquid`: top marquee `fill_below` cream → **pink**, so pink flows straight
  from the top wave into the badge band (no cream gap).
- `prodani-badges.liquid` (+css): added a **bottom wave marquee** (pink→cream), a
  `--wave` row modifier that offsets the six icons along a valley (trough at Gluten Free,
  edges high — matching the mockup; desktop ≥901px only, flat once the grid wraps), and a
  `--wave-bottom` class that zeroes the section's bottom padding so no flat pink strip shows
  below the wave. New settings: wave toggle, bottom-marquee toggle, marquee items/speed.
- Verified in-browser on staging: both marquees ride the wave, icons follow the valley,
  clean pink→cream, 0 theme-check errors. (Icons confirmed loaded via JS; automation
  screenshots intermittently drop mix-blend-mode compositing, they render in a real browser.)

## 2026-08-29 (cont. 7) — Value strip: cream bg, no bottom marquee, uncut icons

Client revised: drop the bottom marquee, make the section **cream**, and stop the icons
being cut.

- Reverted hero top marquee `fill_below` back to cream (section is cream again).
- Badges section default `bottom_marquee` → false; homepage instance set to cream bg,
  no bottom marquee.
- **Icon clipping fix without new assets:** the badge PNGs are RGBA cocoa circles clipped
  at the *bottom* edge (circle exceeds the 340×245 slice). Confirmed the circle colour is
  exactly #48312A = --cocoa. Wrapped each icon in a `.pd-badge-item__disc` — a cocoa CSS
  circle (same colour) that completes the round silhouette — and switched the img to
  `object-fit:contain` (whole symbol always visible), dropping the old mix-blend-mode hack.
  Result: perfectly round badges with the original cream symbols, never cut.
- Kept the icon wave (not asked to remove). Verified in-browser on staging; 0 theme-check
  errors. (Note: badge imgs are lazy — they pop in a beat after scroll.)

## 2026-08-29 (cont. 8) — Box builder on pink

Client: make the Build Your Box section background pink. Switched `.pd-box` bg cream→pink
and recoloured the elements that would otherwise vanish on pink: step-number circles
pink→cocoa (cream text), upsell banner pink→butter, mobile sticky CTA bg cream→pink. Cards
stay light (butter) for contrast; Most Popular / Best Value tags and cocoa CTA unchanged.
Verified in-browser on staging; 0 theme-check errors.

## 2026-08-29 (cont. 9) — Instagram feed section (Behold.so, free)

Client asked for a "follow us on IG + latest posts" section. Note on feasibility: IG killed
unauthenticated access; live posts need the Graph API (Business account + FB Page) with a
token that expires ~60 days and must refresh server-side — a theme can't hold that securely.

Built an on-brand `prodani-instagram` section that consumes a **Behold.so** JSON feed (free;
Behold connects to IG and holds/refreshes the token; CORS-enabled for client fetch), so the
token never touches the theme and we keep full control of the styling.
- `sections/prodani-instagram.liquid` + `prodani-instagram.css/js`: heading + follow CTA +
  post grid. `prodani-instagram.js` fetches `feeds.behold.so/<feedId>` and renders the latest
  N posts into our markup. Falls back to curated image blocks, then to an empty-state note —
  so it ships today and flips to live posts when a feed id is set.
- Added to the homepage after Reviews (brief §11 UGC). Verified on staging; 0 theme-check errors.

**New ticket — T15:** Dani connects her IG (Business/Creator + FB Page) to a free Behold.so
feed and gives us the feed id (or adds curated images) to turn on live posts.

## 2026-08-29 (cont. 10) — DELICIOUS bleed word → pink

Client: make the DELICIOUS marquee pink (matching the next section) and space the repeats.
Homepage `bleed` settings: `color_text` and `color_bottom` cocoa→pink (#FDC3D4), so the word
is pink and sinks into the now-pink Build Your Box section below (color_top stays cream to
match the baker section above). Widened `.pd-bleed__word span` gap .12em→.5em so it reads
"DELICIOUS  DELICIOUS", not run together. Verified in-browser; 0 theme-check errors.

## 2026-08-29 (cont. 11) — Section text swap, sticky deck title, box reorder

- **Swapped shout ↔ baker text** so each design carries the right content: the section
  with **Dani's photo** (shout) is now **"Meet your baker"** (condensed founder intro +
  "Read my story" → /pages/meet-your-baker); the **cake-tray + facts** section (baker) is
  now **"Where sweet meets balance"** (balance copy, keeping the BATCH/SUGAR/FLOUR/PROTEIN
  pillars). Media/designs unchanged. Full founder story remains on /pages/meet-your-baker.
- **Sticky deck title:** `prodani-stack` head is now `position:sticky` so "What makes
  prodani different" stays visible while the 4 cards stack beneath it (cards pin below via a
  JS-measured `--pd-stack-head-h`). Design unchanged. Runs even under reduced-motion.
- **Reorder:** Build Your Box moved to immediately after the collection; DELICIOUS bleed
  lower band set back to cream (no longer precedes the pink box), letters stay pink.
- Verified in-browser on staging; 0 theme-check errors. Merged to main earlier; **not**
  deployed to production.

## 2026-08-30 — Homepage polish batch (client review)

- **Build Your Balance Box transition:** repurposed the bleed word — text "Build Your
  Balance Box", moved between collection (cream) and box (pink), colours cream→pink, pink
  letters, split 55. This replaces the DELICIOUS marquee (removed per request).
- **Stack cards:** each card now carries a peek label (`figure + title`) and the stagger
  widened to 52px, so every "prodani difference" stays readable in the sliver while cards
  stack (brief §image #18). Body switched to flex so the label fits.
- **Instagram feed:** shows `count` branded placeholder tiles until a Behold feed id / images
  are added, instead of the empty-state note.
- **Contact map:** taller (`min-height` clamp 220→300 / 26→34vw / 330→470).
- **Footer:** link row gap 10→3px (+line-height 1.35); signup card image switched to the
  chocolate cake (`signup_product` → vegan-personal-chocolate-banana-cake-copy).
- **Meet your baker (shout):** added a second short paragraph in her own words.
- **Product card images:** `object-fit` cover→contain on a light studio-grey ground, so the
  landscape personal-cake pack shots show 100% in the square (backdrop extended, not cropped).
  NOTE: this is the no-admin fix; truly replacing the product images (generative-expand +
  re-upload) needs Shopify admin — offer stands.
- Verified in-browser on staging; 0 theme-check errors. Not deployed to production.

## 2026-08-30 (cont.) — Fixes from review

- **Bleed transition:** split 55→75 (step-5 valid) so the "Build Your Balance Box" letters
  sit on cream and submerge into pink at their base, instead of being cut mid-glyph.
- **Stack deck:** peek labels were hidden behind the card's top padding — reduced card
  padding-top (clamp 14–20) and widened the stagger 52→60 so each label ("20g Protein…",
  "0g Added sugar", "27 Recipes…") is fully visible in its sliver. Also reduced the slot/card
  heights (72svh/560→58svh/460, 60svh/440→54svh/410) so the section isn't over-stretched.
- **Contact map:** the big gap under the email row was the grid row-gap (up to 72px) + an
  18px map margin. Split gap into column-gap (kept large) + row-gap 14px and dropped the map
  margin, so the map stretches up to close it.
- Verified in-browser on staging; 0 theme-check errors. Not deployed to production.

## 2026-08-30 (cont. 2) — Mobile bug sweep (iPhone 390px, headless CDP)

Examined the storefront at an iPhone viewport via a headless-Chrome CDP rig
(`/tmp/prodani-mobile-qa.mjs`, adapted from casestudy.mjs — window resize doesn't work on
the automation tab). Found + fixed:

- **Email popup (major):** iOS ignores `overflow:hidden` scroll-lock, so the popup stayed
  fixed at the bottom covering ~40% of the screen and followed the page as it scrolled.
  Fixed with a `position:fixed` body lock (save/restore scrollY) in `prodani-email-popup.js`.
  Verified: with the popup open, `scrollTo(3000)` no longer moves the page.
- **Stack deck (major):** on mobile the card height (70svh/560) exceeded the slot (58svh/460)
  and the wrapped title inflated the pin offset, so cards overflowed and bled into the next
  section with oversized media. Disabled scroll-stacking on ≤760px — cards now render as a
  normal vertical list (static slots/cards, peek labels hidden, media aspect 16/10).
- **Instagram placeholder tiles:** grid stretched them non-square on mobile — added
  `align-items:start`.
- Hero, badges, collection, box builder, baker, reviews all render fine on mobile.
- Product-page mobile capture kept hanging on that page's heavy third-party scripts; PDP
  mobile (macros / sticky ATC / subscribe) not yet fully verified — TODO.
- Verified in-browser (headless mobile) on staging; 0 theme-check errors. Not deployed to production.

## 2026-08-30 (cont. 3) — Client input sheet rewritten for the founder

Rewrote `PRODANI_INPUT_REQUEST.md` (gitignored, private) in plain language for Daniel, with
an **example answer under each question** so she knows the exact format we need (flavor +
nutrition list template, a fill-in prompt for her "about me", pricing confirm, claims
checklist, shipping, subscriptions, brand casing + founder name/pronoun/title, photos, the
logo typo, contact details, token re-issue, admin access). ⭐ marks the four that unlock the
most (prices, claims, flavors, bio).

Corrected the review count everywhere it matters: **Judge.me shows 132 reviews at 4.92★**
(122 five-star, 10 four-star) — not "70+/4.9". T8 now references the real numbers.

**TODO (not done this turn):** the site still says "70+ reviews" / "4.9★" in a few places
(reviews section heading, deck card "4.9★ From 70+ verified reviews", "Read all 70+ reviews")
— update to 132 / 4.92★ on staging when approved.

**Status:** still NOT in production. Live store = Prodani - v.1.0.0 (untouched). All work on
the staging theme (187797799222) + GitHub main.

---

## 2026-08-20 — Video hero, and the 5.6 MB problem solved on the way

**Brief:** drop the circular cake image from the hero, use the storefront's existing
video as the hero background.

That video is the one flagged in `audit/AUDIT.md` as the single highest-impact fix —
5,638 KB, 73% of the homepage payload, direct cause of the 7.8s LCP. So rather than
point at it again, it got fixed.

**Re-encoded it**

| | Original (live now) | Optimised |
|---|---|---|
| Size | 5,638 KB | **374 KB** |
| Video | 1280×720, 3.1 Mbps, 30fps | 1280×720, CRF 27, 24fps |
| Audio | AAC 253 kbps | none |

**93% smaller.** Compared frames side by side at CRF 24 / 27 / 31 against the source —
27 is visually indistinguishable, and behind a scrim nobody would ever tell. The audio
track was free money: a hero background video *must* be muted to autoplay at all, so
those 253 kbps could never be heard.

Written to `assets/hero-video-optimised.mp4` with a poster frame and a README, ready to
upload to Shopify. That closes audit item #1 on its own.

**In the hero**

Full-bleed video bed, muted / loop / playsInline / `preload="metadata"`, poster frame so
something is on screen before it decodes. Under `prefers-reduced-motion` it renders the
poster as a still image and never plays.

Over it sits a two-axis scrim — a horizontal gradient (95% → 70% left to right) and a
vertical one — tuned so the pink type holds over the bright plate in the footage while
the ground still reads as brand chocolate rather than plain black. First pass at 50% on
the right edge washed out under the "O" of INTO; strengthened to 70%.

The video parallaxes slightly slower than the page, so the type reads as sitting in front
of it rather than pasted on.

**Pipeline**

`scripts/embed-video.mjs` fetches, re-encodes and inlines it as a data URI for the
single-file build (needed — the artifact CSP blocks remote media). Degrades gracefully:
no ffmpeg or a failed fetch writes an empty map and the app streams from the CDN instead.
`src/data/video.json` is gitignored like the other generated bundles.

Single-file build is now 7.62 MB, comfortably inside the 16 MB artifact limit.

**Next**

- Client review.
- Upload `assets/hero-video-optimised.mp4` to the live store — biggest single perf win
  available and it's already done.
- Reshoot the personal-size range out of the plastic containers.

---

## 2026-08-20 — Hero meets the ribbon on the wave

**Brief:** two screenshots, before and after. The scalloped hem between the chocolate
hero and the pink ribbon had to go; the chocolate should run all the way down and the
ribbon's own wave should form the boundary.

**Done**

Added a `fillAbove` prop to `TextPath`. It closes the wave path up to the top corners
(`${path} L{vbWidth} 0 L0 0 Z`) and fills it, so the section above ends on exactly the
curve the ribbon follows instead of a straight edge.

The fill is translated by `ribbonOffset - ribbonWidth / 2`, which puts its lower edge
precisely on the ribbon's **top** edge — not the path centreline. Get that wrong by half
the stroke width and you either overlap the ribbon or leave a cream sliver above it.

Removed `.scallop` (and its CSS) from the hero, trimmed the hero's bottom padding that
existed to make room for it.

Both marquees now use the same device — each sits at a chocolate-to-cream boundary (hero
→ shop, and the chocolate mid-band → stacking deck), so both get chocolate above, pink
ribbon, cream below. Dropped the `cocoa` variant: the second marquee's chocolate ribbon
would have been invisible against a chocolate fill. Direction and copy still tell them
apart.

**Debugging note**

Spent a while convinced the fill wasn't rendering — the region below the hero read as
cream in screenshots. Setting the fill to bright green showed the geometry was correct
all along; chocolate-on-chocolate at JPEG compression simply wasn't legible to me in a
downscaled screenshot. Worth remembering: **screenshots here are downscaled ~0.67x from a
2242px viewport**, so `getBoundingClientRect` values do not map 1:1 to screenshot pixels,
and low-contrast boundaries can vanish entirely.

**Next**

- Client review.
- Performance work, then re-measure, before deciding React islands vs Liquid.
- Reshoot the personal-size range out of the plastic containers.

---

## 2026-08-19 — Stats section rebuilt as a scroll-stacking deck

**Brief:** replace the four flat stat cards with the supplied stacking-card component.

**Done**

The four proof points are now full-height cards that pin to the top of the viewport and
scale down as the next one rides over them, gathering into a deck. Each pairs its figure
with a real product photo and its own brand colour — pink, butter, chocolate (cream text),
deep pink.

Two departures from the supplied component:

- **No Lenis.** The demo wraps the whole document in smooth-scroll. That hijacks
  scrolling site-wide and would fight the page's other scroll-linked animations. The
  stack mechanic is just `position: sticky` + `useScroll` and needs no help.
- Tailwind classes → this project's CSS, as with `TextPath`.

**A long debugging detour worth recording**

The cards rendered but never scaled. Chased it a long way: checked for stale
measurements, `prefers-reduced-motion`, React StrictMode double-mounting, and instrumented
the MotionValue with `useMotionValueEvent` — which showed the section's `scrollYProgress`
**never fired at all**. Nor did a plain page-level `useScroll()`.

**None of it was a bug.** framer-motion's scroll tracking is driven by its rAF frameloop,
and Chrome throttles `requestAnimationFrame` in a background/automation tab — the same
throttling that had been freezing every entry animation mid-way all session. Driving the
page with real scroll input instead of `window.scrollTo` showed the deck working
perfectly.

**Rule for next time:** in this automation tab, scroll-linked animation cannot be
verified with `window.scrollTo` + `getComputedStyle`. Use real scroll input and read the
screenshot. rAF-driven values are meaningless otherwise.

**Two genuine fixes did come out of it**

1. **`body { overflow-x: hidden }` → `overflow-x: clip`.** Per spec, `hidden` on one axis
   computes the other to `auto`, which makes `<body>` a scroll container. Scroll libraries
   that walk up for the nearest scrollable ancestor then bind to body — which never
   scrolls, since the page scrolls on `<html>`. `clip` prevents horizontal scroll without
   creating a scroll container. Latent hazard, now closed.
2. **`Shop`'s `Card` is now `forwardRef`.** `AnimatePresence mode="popLayout"` wraps each
   child in `PopChild`, which attaches a ref to measure it. Card was a plain function
   component, so React warned and the measurement was silently unavailable. Console is
   clean now.

**Next**

- Client review.
- Performance work, then re-measure, before deciding React islands vs Liquid.
- Reshoot the personal-size range out of the plastic containers.

---

## 2026-08-19 — Marquee rebuilt on GSAP TextPath, as a wave ribbon

**Brief:** client supplied a `TextPath` component (GSAP text-on-a-path, looping) to
replace the marquee. Keep the pink, drop the cursive. Then: match a reference showing a
much deeper wave. Then: "I don't want background around the container, I want the
background around the text itself."

**Porting the component**

It arrived as TypeScript with Tailwind utility classes; this project is plain JSX with
hand-written CSS and no Tailwind. Ported faithfully with three deliberate changes:

- `fontFamily` became a prop instead of a hardcoded `"sans-serif"`, so Konnect can be
  used. It's applied to **both** the visible text and the hidden measuring text — they
  must match or `getComputedTextLength()` returns the wrong number and the fitting breaks.
- Re-measure on `document.fonts.ready`. Webfonts land after first paint, so the original
  fits the text against fallback metrics and then jumps.
- Skips the timeline under `prefers-reduced-motion`.

Added `gsap` and `@gsap/react`. Tailwind classes became `.textpath` / `.textpath__svg`
rules in `app.css`.

**How the seamless loop actually works** (worth recording, it's non-obvious)

The component only loops without a gap when the text is **longer** than the path — then
it sets `textLength` to the path length and `lengthAdjust="spacingAndGlyphs"` squeezes
it to fit exactly, so the two copies chasing each other meet perfectly. If the text is
*shorter*, `textLength` is left undefined and a visible gap opens up.

So the marquee copy has to be tuned to overrun the path slightly. Measured and adjusted
until both bands sat at **92–94% fit** — seamless, with compression too slight to see.
At 44px the original eight claims came out at 84%, visibly condensed; trimmed to five
items per band.

**The ribbon**

Final note was the important one. A full-width pink rectangle behind a wavy line of text
looks like a band with text in it. What was wanted was the colour hugging the lettering.

Added optional `ribbonColor` / `ribbonWidth` / `ribbonOffset` props: the same path drawn
as a thick stroke behind the text. `ribbonOffset={-12}` lifts the stroke so it centres on
the glyphs' optical middle rather than the baseline — otherwise the text rides the top
edge, since glyphs grow upward from the path. Container background removed entirely; the
cream page now shows above and below the wave.

**Next**

- Client review.
- Performance work, then re-measure, before deciding React islands vs Liquid.
- Reshoot the personal-size range out of the plastic containers.

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

---

## 2026-08-22 — Shopify theme build (`theme/`)

Ported the React prototype in `design/` to a real Shopify theme and put it on an
unpublished preview. **The live store was never touched**: `Prodani - v.0.0.1`
(Minimog 3.5.0) is still the published theme, last modified 2026-03-02.

### Setup
- Shopify CLI installed locally (not globally), Dawn 16.0.0 scaffolded into `theme/prodani/`.
- Auth via a Theme Access token in `theme/.env` (gitignored). Note: Theme Access
  tokens authenticate through `theme-kit-access.shopifyapps.com`, **not** the shop's
  own admin host — testing against `<shop>.myshopify.com/admin` returns 401 for a
  perfectly valid token.
- `theme/reference-minimog/` is a read-only pull of the live theme, gitignored.

### Sections built
header, hero (video + wave ribbon), benefit badges, collection (pills + per-type
rows), chocolate band, stat deck, meet-your-baker, bleed word, reviews, contact
(form + map), footer. Plus a CSS-only brand skin over Dawn's product page.

### Deliberate constraints
- **Product page is CSS-only.** Variant picker, quantity, add-to-cart, Shop Pay and
  pickup are Dawn components wired to Shopify's cart API. Restyling cannot break
  them; rewriting the Liquid could.
- **No invented reviews.** Only verified customer quotes are hard-coded; the rest
  come from the Judge.me widget, which renders server-side from
  `shop.metafields.judgeme.*`.
- **Prototype dependencies dropped.** GSAP, framer-motion and React are replaced by
  plain rAF/scroll handlers; all honour `prefers-reduced-motion`.

### Traps worth remembering
- Dawn sets the root font-size to **10px** (`62.5%`). Every `rem` ported from the
  prototype computed at 62.5% of intent; all converted to px.
- Dawn's `base.css` has `div:empty { display: none }`, which silently collapsed the
  hero scrim to zero height. It is a pseudo-element now.
- `<img>` width/height attributes are presentational hints that **beat**
  `aspect-ratio` unless CSS declares `height`. This rendered one photo 1500px tall.
- Section group files need the group type (`header`/`footer`) at top level, not a
  section type, or Shopify silently ignores the file.
- Shopify serves theme assets as `application/mp4`; a bare `<video src>` will not
  decode it. Use `<source type="video/mp4">`.

### Verification — `npm run preflight`
Read-only suite over the preview theme: route rendering, add-to-cart round trip,
section presence, Dawn remnants, asset resolution, one-`<h1>`-per-page, alt text,
copy hygiene, and a guard that the live theme is still published.
**86 passed, 0 failed, 1 warning.**

Two real a11y defects it caught and we fixed: Dawn ships two `<h1>` on every cart
page, and collection pages had none.

## 2026-08-23 — measuring the rebuild

Committed the Judge.me app embed, the re-sliced badge icons and the flattened
bleed word, then measured both versions of the store so the redesign could be
argued from numbers rather than taste.

**The measurement problem.** The brief was "screenshot the before at 1150px".
The visible browser could not do it: the automated tab reports a fixed
innerWidth of 1333 and `outerWidth` of 0, so it is rendering detached from any
window and `resize_window` succeeds while changing nothing. Two other routes
failed before the third worked:

  - An iframe rig (site framed at exactly 1150px, media queries evaluating
    against the frame) died on the storefront's own headers: `X-Frame-Options:
    DENY` and `frame-ancestors 'none'`.
  - `document.documentElement.style.width` would have laid out at 1150px but
    media queries evaluate against the viewport, so every breakpoint would still
    have been wrong. Faithful-looking and false.

What worked: headless Chrome driven over the DevTools protocol, with
`Emulation.setDeviceMetricsOverride` pinning the viewport to exactly
1150x1000 at DPR 1. `theme/scripts/casestudy.mjs`. It needs the Bash sandbox
disabled — inside it, Chrome's network service crashes on launch.

**Three things that were wrong on the first pass and are worth remembering:**

  1. `performance.getEntriesByType('largest-contentful-paint')` returns `[]`.
     LCP entries are delivered to observers and never added to the main
     performance timeline. The first run reported LCP as 0ms for all eight
     measurements and looked plausible. Same trap applies to `layout-shift`.
     Both are now registered via `Page.addScriptToEvaluateOnNewDocument` so the
     observers exist before the first byte.
  2. The first version ran all five BEFORE loads, then all five AFTER loads. On
     a live storefront that lets one slow minute land entirely on one variant
     and read as a design result. Runs are interleaved now.
  3. Shopify injects its preview bar (`#PBarNextFrameWrapper`) into the
     previewed theme only, so every AFTER screenshot had a control strip across
     the bottom and no BEFORE did. `?pb=0` suppresses it; it goes on both
     variants so the measured URLs stay identical in shape.

**Results** (median of 5, cache disabled, 1150x1000, full data in
`casestudy/metrics.json`):

  homepage weight     6.94MB -> 1.83MB   -74%   (the 5.6MB hero video re-encode)
  homepage LCP          812ms -> 320ms   -61%
  product CLS          0.0759 -> 0.0118  -84%
  product DOM           2,026 -> 743     -63%
  TTFB, all pages       ~147ms -> ~49ms  -66%

TTFB is worth a caveat in either direction: it is server render time, and a
preview theme does not get the full benefit of Shopify's page cache, so the new
theme is measured at a disadvantage there.

Not everything improved, and the case study says so on the page rather than in a
footnote: the homepage carries 53% more elements and is 69% taller (four
sections became nine), the product page lost only 2% of its weight because the
new gallery serves 251KB more photography than the scripts saved, and the
contact page picked up a 100ms long task that is the embedded map. Both versions
still load ~150 scripts, nearly all of it apps and pixels that live outside the
theme; a theme rebuild cannot touch them.

`casestudy/build.py` renders the page straight from `metrics.json`, so no figure
on it is transcribed by hand.

Also added `theme/scripts/crop.py`, the PNG cropper written when `sips` mangled
the badge icons — its `--cropOffset` is measured from the centre of the image,
not the top-left, which displaced every slice by ~1944px.

## 2026-08-23 (later) — live

Published. Theme 187797995830 is main, renamed `Prodani - v.1.0.0`. The old theme
(154419691830, `Prodani - v.0.0.1`) is demoted to unpublished and still in the
library. Rollback:

    cd theme && node scripts/publish.mjs 154419691830 --yes

`ROLLBACK.json` is written before the role swap, not after, so the undo
instruction survives a run that dies halfway.

**Three things only publishing revealed.**

1. **`body` was still white.** The `body{background-color:var(--cream)}` rule in
   the token sheet — added months ago in response to "the rest of the page is
   still white" — never worked. Dawn renders `<body class="gradient">` and paints
   it with `.gradient{background:var(--gradient-background)}`. A class selector
   beats a bare element selector regardless of load order. It looked fixed on the
   homepage only because our sections paint their own grounds edge to edge.

   The fix is in `config/settings_data.json`, not CSS: Dawn's colour schemes now
   carry the brand palette (scheme-1 cream/cocoa, scheme-2 butter, 3 and 4 the two
   browns). One value feeds `--gradient-background` and every other Dawn surface,
   which is why cart and search corrected themselves without being touched.

2. **Product pages had no reviews at all.** Zero `jdgm` elements in the body. The
   homepage renders the store-wide feed from `shop.metafields.judgeme.all_reviews_*`;
   per-product needs its own widget. Added `sections/prodani-product-reviews.liquid`
   using Judge.me's markup contract rather than an app block — an app-block URI
   embeds the extension UUID and a wrong one is dropped *silently*, which for
   something a shopper is meant to read is the worst available failure mode.

   Related, and worth telling Daniel: **no product in this store has any reviews
   attached.** All 70+ are store-wide only, so every product shows "Be the first
   to write a review", and no product will ever show stars in Google results until
   the reviews are associated in Judge.me.

3. **`shopify theme push` to a live theme silently did nothing.** It needs
   `--allow-live`, and refuses to prompt for it non-interactively. The command
   errored, the tail of the output still looked like a success box, and I reported
   it as pushed. What caught it was the new product-page check in preflight, not
   me reading the output properly. `tail -3` on a deploy is not verification.

**Also worth remembering:** two of the checks I wrote for that new section passed
against a page with no widget on it, because Judge.me ships a settings stylesheet
naming every `jdgm-*` class it owns and a substring search finds them there.
Section 3b now strips `<style>` and `<script>` before searching for markup.

And one change reverted: the review section briefly forced `display:flex` onto
Judge.me's widget header to line the button up with the summary. It stacked the
title on the summary text and clipped the button label. The file's own header
comment already said restyle surfaces, never structure.

**Measured again after launch**, which flipped which theme gets Shopify's page
cache. The paint and weight results reproduce, and TTFB came back at -69% having
been -68% when the bias ran the other way — so it is genuine render time, not
caching. Post-launch data in `casestudy/metrics-post-launch.json`; the published
case study now uses it.

  homepage weight   6.95MB -> 1.83MB   -74%
  homepage LCP        768ms -> 352ms   -54%
  product CLS        0.0753 -> 0.0118  -84%
  product DOM         2,021 -> 643     -68%
  TTFB, all pages    ~151ms -> ~51ms   -66%

The product page is now 5% *heavier* (1.91MB -> 2.01MB): larger gallery
photography plus the reviews widget it previously did not have. The case study
says so.

Live checks: 89 passed, 0 failed against https://prodanimiami.com, add-to-cart
included (added, verified, cleared).

## 2026-08-23 (end of session) — packaged and handed off

The case study is now a deliverable rather than a working directory.
`casestudy/` holds `HANDOFF.md`, `README.md`, `copy.md`, `metrics.csv`, two page
builds, tidied images, and both raw datasets. 7.2MB total.

Nothing in `copy.md`, `metrics.csv` or either page is typed by hand — all of it
is generated by `build.py` from `data/metrics-post-launch.json`. A portfolio
piece is the wrong place for a transcription error because it drifts silently
and nobody re-checks it.

Two page builds from one template: `page/index.html` (53KB, references
`images/`) and `page/self-contained.html` (2.4MB, everything inlined). Both are
complete HTML documents with title, description, Open Graph and favicon. The
bare fragment the artifact host wraps for itself is written to /tmp — it is a
publishing intermediate, not something to upload.

`HANDOFF.md` briefs the agent that will publish this to switchcasestudio.com. It
carries two sections that exist because a publishing agent will otherwise get
them wrong: a **do-not-claim** list (no conversion or revenue figures, no
Lighthouse score, no Core Web Vitals pass, not a migration, no invented client
quotes) and a note that the **four figures that moved the wrong way stay in**,
with the argument attached, because the instinct when laying out a portfolio
piece is to cut them.

Corrected a note that had gone stale between the two measurement runs: the
contact page's load time was described as "a wash" from the pre-launch data. On
the post-launch run it is 9% slower — the map costs more than the removed
scripts saved. Paint is still 20% faster, which is the part a visitor feels.

**Two things that cost real time and will again:**

  - Chrome stopped launching entirely partway through the session. 54 orphaned
    processes had accumulated from earlier runs, each holding a debugging port
    and a profile directory. The symptom is "chrome never came up", which reads
    as a bug in the script. `pkill -9 -f "Google Chrome"` before a batch.
  - Navigating to a `data:` URL carrying two 1150px JPEGs is roughly 300KB of
    address, and the renderer dies partway through a batch. `compose.mjs` writes
    a temp file and navigates to `file://`, with a fresh target per frame.

---

## Where this stands

**As of 2026-08-31 — Dani has pivoted the brand to one hero product (Personal
Protein Cakes; see the 2026-08-31 "later" entry). Phases 1-3 and part of phase 4
are on STAGING. Nothing has been deployed to production. The remaining work is
mostly gated on Dani (T1/T2/T6/T7 and T11 photography), not on us.**

- **Live (untouched):** `Prodani - v.1.0.0` (theme 187797995830) on prodanimiami.com.
  It is still the launch build — none of the v2 work is on it.
- **Staging (all v2 work):** `prodani - staging` (187797799222).
  Preview: `https://prodanimiami.com/?preview_theme_id=187797799222`
- **GitHub main** is current with all v2 code (public repo — confidential docs are gitignored).

`push:live` has never been run this cycle. Going live is an explicit, approved step.

    cd theme && npm run push:staging                              # deploy to staging (default)
    cd theme && npm run push:live                                 # PRODUCTION — only on approval
    cd theme && node scripts/publish.mjs 154419691830 --yes       # rollback to v.0.0.1
    cd theme && LIVE=1 SHOP_URL=https://prodanimiami.com \
      PREVIEW_THEME_ID=187797995830 EXPECT_LIVE_ID=154419691830 \
      node scripts/preflight.mjs                                  # 89 checks against live

### What v2 added (all on staging)

Product page (metafield-driven macros, badges, trust row, info accordions, mobile sticky
ATC), Build Your Balance Box builder (custom, Option A), subscription selector (native
Shopify selling plans), email-capture popup, Instagram section (Behold.so), category
navigation (collection-linked tabs + header dropdown support), SEO meta descriptions,
reordered homepage, and a batch of client-directed visual work.

### Blocked on Daniel — these gate go-live

Full plain-language sheet: `PRODANI_INPUT_REQUEST.md` (gitignored, private).

  1. **T1 Pricing/unit** — one-time vs subscription per-cake gap needs confirming.
  2. **T2 Claims** — approve + substantiate every nutrition claim before publishing.
  3. **T3 Flavors as products** — six **draft** products now exist (created 2026-08-31,
     $9.00 placeholder, 0 inventory). Still needs from Dani: real names (T17), real
     pricing (T1), real inventory, and per-SKU metafield values.
  4. ~~**T4 Product metafields**~~ — **DONE 2026-08-31** (all 19 `prodani.*` definitions
     created in admin). Values still unset; **T2 gates the claim booleans**.
  5. **T5 Shipping rule** — $99+? refrigerated/frozen/shelf-stable?
  6. **T6/T7 Brand casing + founder details** (Prodani vs ProDani; name/pronoun/title).
  7. **T8 Reviews not attached to products.** Judge.me shows **132 reviews at 4.92★**
     (122×5, 10×4) store-wide, but none linked to a product — so no Google star snippets.
  8. **T9 Footer logo reads "HIGH PROTEIN DESERTS"** — missing an S; needs new artwork.
  9. **T10 Conflicting contact details.** Phone `+1 305 481 1441` vs `+1 (786) 567-7077`;
     address `3131 NE 1st Ave` vs `125 NE 32nd St, apt 1115`. Live shows the first of each.
  10. **T11 Photography** — placeholders in a few slots; personal range still shot in
      plastic meal-prep containers and should be re-shot on a plate.
  11. **T12 Subscriptions** — install Shopify Subscriptions, define plans/VIP rules.
  12. **T13 Re-issue the Theme Access token** — it appeared in plaintext; treat `theme/.env`
      as compromised.
  13. **T14 Header dropdown** — Dani must add a "Shop" menu with the 4 category child links
      in admin → Navigation (theme already renders submenus).
  14. **T15 Instagram** — connect IG to a free Behold.so feed; guide in `INSTAGRAM_FEED_SETUP.md`.
  15. ~~**T16 Create the "Build a Box" page**~~ — **DONE 2026-08-31.** Page created
      (id 163911598390), **Hidden**. At go-live: set Visible + assign the `build-a-box`
      template. Links still target `/#box` meanwhile.
  16. **T17 Final flavor lineup** — Dani's pivot fixes 5–6 core flavors max, but the
      actual flavors are still in development. Current six on-site are placeholders.
      Supersedes the flavor list side of T3; T3's "flavors as real products with
      inventory + per-SKU macros" is now the critical path for the whole shopping flow.

### Open TODOs on our side

  - ~~Site copy still says "70+ reviews" / "4.9★"~~ — **DONE 2026-08-31.** Now 132 / 4.92★
    everywhere; preflight confirms no stale counts remain.
  - **Product page mobile QA — STILL BLOCKED, and now with three ruled-out approaches.**
    Attempted again 2026-09-01 and failed again. What was tried, so nobody repeats it:
      1. `Page.domContentEventFired` — never fires within 60s on the PDP.
      2. Polling `document.readyState` instead of waiting on an event — hangs.
      3. Fixed 20s wait, no load events at all, plus `Network.setBlockedURLs` on
         Judge.me / GA / GTM / Klaviyo / Meta / TikTok / Clarity / monorail — the
         subsequent `Runtime.evaluate` still hangs, so the renderer itself is wedged,
         not merely the load event.
    So macros / sticky ATC / subscribe toggle remain **unverified at 390px**. Next
    ideas if someone picks this up: run against the local `theme dev` server rather
    than the live domain (removes Shopify's own script injection), or use a real
    device / BrowserStack. Do not report this as done without a render.
  - Product data cleanup (categories, vendor normalisation, archived bundles) — the
    themes-only token still 302s on `products.json`, but **browser admin access now
    exists**, so this is doable through the admin UI when the catalog decision is made.

### If the before/after ever needs re-running

The "before" side now only exists behind `?preview_theme_id=154419691830`. If
that theme is ever deleted from the library the comparison becomes
unreproducible — `casestudy/images/before/` and `casestudy/data/` are the record
at that point.
