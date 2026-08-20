# Prodani Miami — Shopify Theme

Theme development and site-audit workspace for the **ProDani Miami** storefront (high-protein cakes and muffins, Miami).

## What this repo is

- The Shopify theme source, pulled from the live store via the Shopify CLI.
- A site audit (`audit/`) — Lighthouse reports plus an on-page SEO crawl — and the findings written up in [`audit/AUDIT.md`](audit/AUDIT.md).
- A running [`WORKLOG.md`](WORKLOG.md) of what changed each session.
- A redesign concept in [`design/`](design/README.md) — a React build in the brand's own chocolate/pink/cream palette, running on the real catalog.

> **This repo is public.** No credentials, tokens, store admin URLs, or customer data belong here. See `.gitignore` — it is deliberately over-broad. If you are unsure whether a file is safe, do not commit it.

## Local dev workflow

Requires [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) and Node 18+.

```bash
# Authenticate (opens a browser; never commit the resulting .shopify/ dir)
shopify auth login

# Pull the live theme into this working copy
shopify theme pull

# Run a local dev server with hot reload against the live store data
shopify theme dev

# Push changes back — ALWAYS to an unpublished theme first
shopify theme push --unpublished --theme "wip-<yourname>"
```

Only publish to the live theme after review. `shopify theme push` with no flags targets whatever theme is currently selected — check twice.

## Running the audit

```bash
npx lighthouse https://prodanimiami.com \
  --output=html --output=json \
  --output-path=./audit/lighthouse-home \
  --only-categories=performance,seo,accessibility,best-practices \
  --chrome-flags="--headless=new"
```

Repeat for a collection page and a product page, changing the URL and the `--output-path` name. Results land in `audit/` as `lighthouse-<page>.html` / `.json`.

Reports are single-run mobile emulation and vary ±5 points between runs — re-measure before and after any performance work rather than trusting one number.

## Project structure

```
.
├── audit/
│   ├── AUDIT.md              # The written report — start here
│   ├── seo-crawl.json        # Extracted on-page SEO signals per template
│   ├── lighthouse-home.*     # Lighthouse HTML + JSON, homepage
│   ├── lighthouse-collection.*
│   └── lighthouse-product.*
├── WORKLOG.md                # Dated session log, newest first
├── README.md
└── .gitignore
```

Once the theme is pulled, the standard Shopify directories (`assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`) sit alongside the above. Note that `.gitignore` excludes `config/*.yml` (CLI auth) while keeping `config/settings_schema.json` and `config/settings_data.json`, which are theme source.

## Audit summary

Full detail in [`audit/AUDIT.md`](audit/AUDIT.md). Headline: a **5.6 MB autoplaying hero video** accounts for 73% of the homepage payload and is the primary cause of a 7.8 s LCP.

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Home | 55 | 72 | 73 | 85 |
| Collection | 74 | 74 | 77 | 92 |
| Product | 45 | 74 | 77 | 92 |
