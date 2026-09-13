# ProDani Miami: Cake, with a plot twist.

A standalone React campaign prototype. Everything lives in this directory; the Shopify theme is unchanged.

## Run

Requires Node 22.12+.

```sh
cd prototypes/webgl-hero
npm ci
npm run dev
```

Open **http://localhost:5173**. Scroll naturally through the four acts, use the chapter controls, or choose “Meet the cake” to jump to the reveal. The pause button stops ambient drift and pointer motion while preserving scroll scrubbing. Product and shop links open the real ProDani storefront.

```sh
npm run build      # TypeScript + production bundle in dist/
npm run preview    # Serve the production build on localhost:4173
npm run lint
npm test           # Playwright browser and accessibility checks
```

Tests automatically use installed Chrome on macOS. Elsewhere, run `npx playwright install chromium`, or set `CHROME_PATH` to your Chrome executable. Tests start the dev server if necessary.

## Creative approach

An exploded chocolate daydream becomes a personal cake. ProDani's cream, pink, espresso, original wordmark, Fugaz One display face and Damion script establish the identity. A quiet berry tone provides accessible pink-family headline contrast. Oversized type gives each act its own voice:

1. **The craving:** an inviting, partially separated cake surrounded by cocoa crumbs and chocolate-like fragments.
2. **The good stuff:** the components open up; crumbs travel along curved spatial paths as the camera turns.
3. **The plot twist:** particles converge, sponge sections join, and a rippled fudge cap settles over the loaf.
4. **Your cake:** a restrained camera push reveals the complete cake, its four product facts and a clear CTA.

The next section brings the visitor back to real product photography and Dani's story. Design settings: variance 9, motion 9, density 3. Native CSS implements this brand aesthetic without a generic UI kit.

## Technical approach

**Vite + React + TypeScript + Three.js + GSAP ScrollTrigger.** Direct Three.js inside a React lifecycle boundary provides explicit resource ownership and a single GSAP rendering clock. R3F and a separate render loop are unnecessary for this focused scene.

- A reserved **440svh desktop / 370svh mobile and portrait-tablet** section and native CSS sticky stage create the pin. ScrollTrigger scrubs a normalized timeline over the reserved space. Loading the scene never changes the section's height. No smooth-scroll library or wheel/touch interception.
- `gsap.ticker` renders Three.js after GSAP updates the DOM and shared progress. No frame-by-frame React state updates. Every assembly transform is derived from progress and seeded data; reverse scrubbing is deterministic.
- A custom indexed loaf, ganache geometry, generated cocoa texture, physical materials, studio environment, soft shadow, instanced crumbs and a soft particle shader supply depth. The cake is a complete 3D object, not a flat product image with decoration.
- `ResizeObserver` adapts the viewport and camera; resolution media queries handle DPR changes even while paused. DPR is capped at 1.7 desktop / 1.4 phone. Smaller initial viewports use fewer crumbs.
- Rendering stops outside the scene, when the document is hidden, or once paused values settle. Timelines, ticker callbacks, observers, listeners, geometry, materials, instances, textures, environment maps and the renderer are disposed on cleanup.
- The 3D bundle loads on demand. Fonts are preloaded, texture loading precedes the first frame, and a branded loading message fills the product space.
- Semantic DOM copy stays sharp. Inactive acts are hidden and inert. Native links/buttons retain visible keyboard focus and accessible names.
- **Reduced motion** replaces the long sequence with a compact photographic product hero. Failed initialization or context loss uses the same fallback. Preview it with `?webgl=off`.

## Files worth knowing

- `src/components/Experience.tsx`: lifecycle, semantic acts, single GSAP timeline.
- `src/animation/config.ts`: scrub duration, act boundaries, DPR and math helpers.
- `src/scene/createScene.ts`: camera, lighting, renderer and cleanup.
- `src/scene/Cake.ts`: cake geometry and assembly transforms.
- `src/scene/Ingredients.ts`: crumb trajectories and cocoa dust.
- `src/scene/materials.ts`: cocoa material and deterministic backup texture.
- `src/styles.css`: brand system and intentional desktop/tablet/mobile compositions.
- `src/assets.ts`: centralized assets and storefront destinations.
- [Asset manifest](docs/ASSET-MANIFEST.md): audit, provenance and exact replacement requirements.
- [Content sources](docs/CONTENT-SOURCES.md): product-specific claim boundaries.
- [Texture prompt](docs/TEXTURE-PROMPT.md): generated material disclosure.
- [QA notes](docs/QA.md): browser coverage and remaining limitations.

## Remaining limitations

The procedural loaf and generated crumb material are an art-directed interpretation, not a scan or approved new product photograph. The manifest defines the GLB, texture and photo assets needed for exact product fidelity. The assembly is a cinematic metaphor, not the literal baking process. There is no commerce backend in this prototype. Safari on physical iOS devices and lower-end Android GPUs still need hardware validation before production use. The pinned presentation is deliberately taller than a normal hero; reduced motion removes that extra scrolling.
