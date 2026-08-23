# Theme migration notes — content that lives in the THEME, not the database

Pulled from `reference-minimog/` (live Minimog v3.5.0). Everything below is
theme-scoped: it does NOT come with the products/orders/customers when we switch
themes, and it will vanish from the storefront unless rebuilt in the new theme.
Re-generate with: `npm run pull:reference`

## Pages — both have EMPTY Content fields in the admin

| Page | Handle | Template | Body content in DB |
|---|---|---|---|
| Meet Your Baker | `meet-your-baker` | `about-us` | **empty** — all copy is in the theme |
| Contact | `contact` | `contact` | **empty** — all copy is in the theme |

Switching themes without rebuilding these leaves both pages blank. The new theme
must provide `page.about-us` and `page.contact` templates, or the pages must be
reassigned to the default `page` template with the copy moved into the DB.

## Meet Your Baker copy (verbatim, from page.about-us.json)

> Hey there! I'm Daniel, the brain and brawn behind Pro Dani Miami. Let me give you the lowdown on how this sweet adventure began. As a personal trainer, I've always had one foot in the fitness world and the other in the world of tempting treats. I'd see my clients struggle to satisfy their sweet tooth while staying on track with their health and fitness goals. It got me thinking: why isn't there a bakery that offers cakes and muffins that are not only delicious but also high in protein, gluten-free, and low in sugar? That's when the lightbulb moment struck, and Pro Dani Miami was born. I wanted to create a place where people like you and me could indulge our sweet cravings without feeling like we're sacrificing our commitment to healthy eating.

> At Pro Dani Miami, we're all about striking that perfect balance. Our cakes and muffins are my labor of love, crafted with top-notch ingredients and a dash of passion. I'm a stickler for quality, so rest assured, each bite is a testament to our dedication to excellence. Whether you're a fitness fanatic, have dietary restrictions, or just appreciate a good treat, we've got something special in store for you. Join me on this journey where you can have your cake and eat it too—where indulgence meets wellness, and sweet cravings become a wholesome delight. I invite you to dive into the world of Pro Dani Miami, where we've cracked the code on making dessert a guilt-free pleasure. Your satisfaction is my mission, and I can't wait for you to experience the joy of our high-protein, gluten-free, and low-sugar creations. Welcome to a place where taste and health go hand in hand. Welcome to Pro Dani Miami!

## Contact page

- **We would love to hear from you.**
  - Please feel free to contact us regarding caterings for events or bigger orders. We will be more then happy to offer you special discounts and offers.
  - 3131 NE 1st Ave, Miami, FL, 33137
  - +1 305 481 1441

## Store contact / social (from config/settings_data.json)

| Setting | Value |
|---|---|
| Instagram | https://instagram.com/prodanimiami |
| Facebook | https://www.facebook.com/profile.php?id=61550592411869 (no vanity handle) |
| Theme phone | +1 (786) 567-7077 |
| Contact page phone | +1 305 481 1441 |
| Admin store phone | 305-481-1441 |
| Email | pdprodani@gmail.com |
| Contact page address | 3131 NE 1st Ave, Miami, FL, 33137 |
| Admin store address | 125 NE 32nd St, apt 1115, Miami FL 33137 |

**Three different phone numbers and two different addresses are live.** Needs a
decision from Daniel on which is correct before the new theme ships.

## App embed that must be re-enabled on the new theme

- `shopify://apps/judge-me-reviews/blocks/judgeme_core` — enabled on Minimog.
  Review data is safe (Judge.me + metafields); without this block it renders blank.

## Minimog custom templates (fall back to default if unmatched)

Only `about-us` and `contact` are actually assigned to anything. The rest are
unused theme scaffolding and can be ignored:

```
collection.flash-sale      page.faqs            product.compare
page.find-a-store          page.wishlist        product.custom-layout-1..5
page.product-compare       page.judgeme_all_reviews
product.docapp-free-gift   product.grid-card-item
```

