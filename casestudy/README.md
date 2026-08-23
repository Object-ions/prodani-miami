# ProDani Miami case study — upload package

Everything needed to publish this as a case study on switchcasestudio.com.

## What's here

```
copy.md                    the whole case study as text, ready to paste
metrics.csv                every measurement as a flat table (opens in Sheets/Excel)
page/index.html            the finished page — 53KB, loads images from ../images/
page/self-contained.html   the same page as one 2.4MB file, images inlined
images/
  cover-1200x630.jpg       link-preview / thumbnail card
  pairs/*.jpg              side-by-side before+after, one per page, 2324×1076
  before/*.jpg             the old theme
  after/*.jpg              the new theme
data/
  metrics-pre-launch.json  raw run 1 — old theme live, new theme in preview
  metrics-post-launch.json raw run 2 — after publishing, roles reversed
build.py                   regenerates page/index.html, copy.md and metrics.csv
compose.mjs                regenerates images/pairs and the cover
```

## Which page file to use

Both are complete HTML documents with the same content, a `<title>`, a description and
Open Graph tags. They differ only in how images are carried:

- **`page/index.html`** — 53KB, references the files in `images/`. Use this one if you are
  uploading to a site: keep the `page/` and `images/` folders next to each other and it
  works, and the browser can cache and lazy-load the images properly.
- **`page/self-contained.html`** — 2.4MB, every image and the display font embedded. One
  file, no dependencies. Use it for emailing, or anywhere that will only take a single file.

## Which images to use where

| Need | File |
| --- | --- |
| Thumbnail, social card, index tile | `images/cover-1200x630.jpg` |
| The one image that tells the story | `images/pairs/home.jpg` |
| A section per page | `images/pairs/product.jpg`, `baker.jpg`, `contact.jpg` |
| A single screenshot | `images/after/home-1150.jpg` |
| Whole-page shots (tall) | `images/*/[page]-fullpage.jpg` |

Every `-1150.jpg` is exactly 1150px wide — the width the comparison was measured at, so
before and after are directly comparable. The `-fullpage.jpg` files are the entire
document at that width and are very tall (the new homepage is 10,718px); they work best
inside a fixed-height scrolling frame rather than laid out at full size.

## Using the copy

`copy.md` is plain Markdown with tables and footnotes. It is written to stand on its own —
the method section is what makes the numbers quotable, so keep it if you keep the numbers.

## Using the numbers

`metrics.csv` has one row per page per measurement: before, after, change, whether lower
is better, and a note where a figure needs explaining. Four rows carry notes, and they are
the four places a number moved the wrong way. They are in the file on purpose — a
before/after that only shows the green numbers reads as an advertisement, and anyone
technical enough to be impressed by the good figures will notice the missing ones.

## Regenerating

Nothing in `copy.md`, `metrics.csv` or the page is typed by hand — all three are generated
from `data/metrics-post-launch.json`, so they cannot drift apart or contain a transcription
error.

```
python3 build.py      # both page files + copy.md + metrics.csv
node compose.mjs      # images/pairs/*.jpg + cover
```

`compose.mjs` lays the screenshots out in HTML and screenshots the result through headless
Chrome, because there is no image library installed on this machine. It needs Chrome at the
standard macOS path.

To re-measure the live site from scratch, from `../theme`:

```
node scripts/casestudy.mjs        # writes /tmp/prodani-casestudy/metrics.json
```

That drives a headless Chrome at a pinned 1150×1000 viewport, five interleaved runs per
page per theme. It is read-only against the storefront — it navigates and measures, and
writes nothing to the store.

## One caveat worth carrying over

The old theme is now unpublished, so the "before" side is captured through
`?preview_theme_id=154419691830`. If that theme is ever deleted from the store's theme
library, the before column becomes unreproducible. The screenshots and JSON in this folder
are the record at that point — keep them.
