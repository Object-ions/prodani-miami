# Asset manifest

All runtime paths are centralized in `src/assets.ts`. All runtime media are local: the prototype makes no third-party image or font requests. Original source references are retained in `docs/references` and are not part of the production bundle.

| File | Dimensions / format | Alpha | Source / use |
| --- | --- | --- | --- |
| `public/assets/wordmark.png` | 900 × 243 PNG; displayed at 143px desktop / 113px mobile | Yes | Exact ProDani theme wordmark; CSS recolors its silhouette espresso without changing the letterforms. |
| `public/assets/fugaz-one-latin.woff2` | WOFF2, 11KB | N/A | Theme's pink brand skin display font. |
| `public/assets/instrument-sans-var-latin.woff2` | Variable WOFF2, 29KB | N/A | Existing theme body font; locally hosted. |
| `public/assets/damion-latin.woff2` | WOFF2, 18KB | N/A | Theme's pink brand skin script font. |
| `public/assets/chocolate-fudge.jpg` | 1080 × 1080 JPEG, ~193KB | No | ProDani product media `RE3_a72ac65e-d455-4d26-8062-66485f9e423e.png`; editorial section. Format conversion only. |
| `public/assets/chocolate-detail.jpg` | 1000 × 1000 JPEG, ~202KB | No | ProDani product media `Moistchocolatefudgecake_2.png`; static fallback. Format conversion only. |
| `public/assets/cocoa-crumb.jpg` | 1024 × 1024 JPEG | No | AI-generated macro cocoa sponge texture. Albedo and approximate bump source. Illustrative, not an actual product photograph. |
| `public/assets/dani.jpg` | Original theme JPEG | No | Audited founder asset, reserved for follow-on use. Not loaded by the prototype. |
| `public/favicon.svg` | 64 × 64 SVG | No | Simple typographic favicon; not a replacement logo. |
| Runtime cake | Procedural Three.js indexed geometry | N/A | Rounded rectangular loaf, two separable cake components, soft ganache cap, retained surface crumbs. |
| Runtime atmosphere | Instanced geometry + point cloud | N/A | Cocoa crumbs and chocolate-like fragments, seeded curved trajectories. No simulations or baked video. |
| Runtime shadow | 128 × 128 canvas texture | Yes | Soft studio contact shadow; generated locally. |

## Audit and provenance

- Inspected `theme/prodani/assets`, the existing hero Liquid/CSS/GSAP files, brand tokens and skins, project README, metafield claims policy, and `PRODANI_QUESTIONS_2026-08-31.md`.
- The pink skin explicitly identifies cream `#FBF5E8`, pink `#FDC3D4`, deep pink `#F79CBB`, Fugaz One and Damion. Those values take precedence over unrelated alternative theme skins.
- The supplied hero video is a 13.79-second, 1280 × 720 H.264 fudge-pour shot (~374KB). Inspected its poster and a middle frame (retained in `references/hero-video-frame.jpg`). It shows plated cake rather than isolated assembly passes, so it cannot directly provide this reversible spatial story. Existing full-page screenshots are reference material rather than product assets.
- The public product endpoint contained four media entries and no video/3D model. The first photo shows a packaged rectangular loaf; two photos show plated slices; the fourth is a catalog graphic. No production cutout, separate frosting pass, transparent ingredients or GLB was supplied.
- Original product JSON was fetched read-only on 2026-09-12 from `https://prodanimiami.com/products/moist-chocolate-fudge-cake-copy.js` and is retained in `docs/references/product.json`.
- Original product photos are in `docs/references/cake-1.png` through `cake-3.png`.

## Temporary / illustrative material

The procedural cake is a finished art-directed stand-in, shaped from the supplied rectangular loaf and slice photography. Its exact dimensions, cut into components, surface pores and ganache waves are interpretive. Chocolate-like fragments reference the product's photographed visual world; they are not presented as a separate ingredient claim. The assembly is a visual metaphor, not a depiction of the baking process or a claim that the product has two baked layers.

The texture is generated using the built-in image generation tool, not the OpenAI CLI. Its prompt and source output provenance are in `TEXTURE-PROMPT.md`. The code includes a deterministic canvas-material fallback if that texture cannot load.

## Exact production replacement brief

| Replacement | Required deliverable | Framing / treatment | Recommended delivery |
| --- | --- | --- | --- |
| Hero cake | `personal-chocolate-fudge.glb` | Match the real personal SKU out of its container; model the complete loaf with independently named `cake_lower`, `cake_upper`, `ganache`, and `crumbs` nodes. Local origin at the cake center, Y up; normalized overall width 3.65 units. Neutral material lighting. | Under 3MB; 40–90K triangles; Meshopt compression; 2048px KTX2 base-color/normal/roughness maps. Optional 1024px mobile textures. |
| Real crumb scan | `cocoa-crumb.jpg` plus a separate linear normal/roughness map if available | Perpendicular, even-light macro, no background or hard shadows, calibrated color; cover about 6–10cm of actual cut sponge. Tileable edges preferred. | 1024–2048px square; JPEG/WebP under 300KB each. Current adapter uses one albedo as approximate bump. |
| Transparent product fallback | `personal-chocolate-fudge-cutout.webp` | Whole actual product, no packaging; camera 20–25° above tabletop, 25–35° from front, long face visible; entire product with 12% safe margin. | 1800 × 1400 RGBA WebP; true alpha; under 500KB. Supply shadow separately. |
| Assembly photo alternative | `cake-lower.webp`, `cake-upper.webp`, `ganache.webp` | Locked camera, lens, scale, light and alignment across all passes; identical pixel canvases and true transparency. | 1800 × 1400 RGBA WebP each; under 350KB each. Requires a plane-based renderer adapter, not a filename-only GLB swap. |
| Optional chocolate fragments | `chocolate-fragments.glb` | Five to eight varied forms approved for the actual SKU's visual presentation; no embossed branding. | Under 150KB total; shared PBR material. |

To replace only the texture, overwrite its documented local file and update `assets.cocoaTexture` if the name changes. To replace geometry, implement the same `{ root, update(progress) }` interface in `src/scene/Cake.ts` and map the incoming GLB nodes to the component transforms. Geometry replacement is an adapter change, not a claim that any arbitrary GLB will automatically animate correctly.
