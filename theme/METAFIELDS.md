# Product metafields — the CMS contract for the PDP

> The brief (§08, §10) requires macros, ingredients, allergens, and badges to live in
> **CMS fields, not hard-coded**, so one product change can't leave conflicting claims
> across the site. This theme's PDP reads the fields below.
>
> **Who creates these:** Dani / Daniel, in **Shopify admin → Settings → Custom data →
> Products** (metafield *definitions*), then per-product values. The theme-access token
> used for development is **themes-only** and cannot create definitions or edit products
> (ticket **T4**). Until these exist, the PDP shows clearly-marked **sample** values on
> staging so the layout is reviewable — nothing false is published to the live store.

## Namespace: `prodani`

| Key | Type | Example | Used by |
|---|---|---|---|
| `taste` | Single line text | "Fudgy chocolate, soft crumb" | Above-fold taste line |
| `protein_g` | Integer | 20 | Macro strip |
| `calories` | Integer | 180 | Macro strip |
| `sugar_g` | Integer | 2 | Macro strip |
| `carbs_g` | Integer | 14 | Macro strip (optional) |
| `fat_g` | Integer | 6 | Macro strip (optional) |
| `protein_source` | Single line text | "Grass-fed whey isolate" | Nutrition accordion |
| `ingredients` | Multi-line text | full ingredient list | Ingredients accordion |
| `allergens` | Single line text | "Contains milk, egg" | Allergens accordion |
| `storage` | Single line text | "Keep refrigerated" | Storage accordion |
| `shelf_life` | Single line text | "Best within 7 days chilled" | Storage accordion |
| `nutrition_facts` | Rich text | full nutrition table | Nutrition accordion |
| `faq` | Rich text | product-specific Q&A | FAQ accordion |

### Claim badges (booleans — each maps to an existing badge PNG)

| Key | Type | Badge asset |
|---|---|---|
| `high_protein` | true/false | `prodani-badge-high-protein.png` |
| `gluten_free` | true/false | `prodani-badge-gluten-free.png` |
| `no_sugar_added` | true/false | `prodani-badge-no-sugar-added.png` |
| `non_gmo` | true/false | `prodani-badge-non-gmo.png` |
| `low_calorie` | true/false | `prodani-badge-low-calorie.png` |
| `high_fiber` | true/false | `prodani-badge-high-fiber.png` |

> **Claims gate (T2):** a badge/claim must only be switched **true** for a SKU once Dani
> has approved and can substantiate it. The theme just displays what admin sets — it does
> not assert any claim on its own.

## Reviews (separate system)

Star rating + count above the fold come from **Judge.me**, not these metafields. They
only appear once reviews are **attached to the product** in Judge.me (ticket **T8**).
