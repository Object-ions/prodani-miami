# QA and visual review

Tested in local Google Chrome through Playwright on 2026-09-12. **Production build passed, ESLint passed, and all 11 browser tests passed.** Screenshots are saved in `artifacts/`; `npm test` also creates an HTML report in `playwright-report/`.

The production server is separately exercised with `node scripts/verify-production.mjs` (requires `npm run preview`). It captures all four acts and the story section at desktop and mobile sizes and records failed requests and console output in `artifacts/production-check.json`.

## Coverage

- All four acts at 1920 × 1080, 1440 × 900, 1280 × 720, 768 × 1024 and 390 × 844.
- Forward scrubbing, reverse scrubbing and exact matching of the isolated WebGL composition after a round trip. DOM transforms and visibility are checked separately because Chromium can rasterize identical text differently after recreating a hidden compositing layer.
- Primary CTA visibility and hit testing in opening and reveal.
- Chapter navigation, Meet the cake, replay, native outbound links and keyboard focus.
- No horizontal page overflow or failed asset requests at the tested sizes.
- No page errors or browser console warnings/errors during normal operation.
- Reduced-motion photographic hero, explicit fallback preview, simulated unavailable WebGL 2 and context loss.
- Resize from desktop into the mobile layout while ambient motion is paused.
- Automated WCAG 2 A/AA and WCAG 2.1 AA checks with axe on opening and reveal.
- TypeScript production build and ESLint.

## Visual refinements made

Replaced disconnected per-vertex deformation with coherent indexed geometry; added the cocoa macro material; removed harsh ganache reflections; made the final loaf continuous; reduced foreground clutter; recolored the original pale wordmark for legibility; rebuilt portrait tablet composition; corrected mobile word spacing; preserved text transforms when scrubbing backward; added an explicit paused-resize redraw.

## Practical limits

This is a studio prototype, not a hardware certification. Chrome desktop emulation does not replace testing touch performance, thermal behavior, mobile browser chrome, VoiceOver and Safari on real devices. Automated accessibility checks are useful coverage, not a complete manual accessibility audit. No framerate or Core Web Vitals score is claimed without representative device measurements.

The 3D engine is intentionally a separate deferred chunk (~136KB gzipped). This prototype does not add depth-of-field postprocessing because it softens the readable product texture and adds mobile GPU cost; depth is supplied by real perspective, camera travel, physically based lighting, parallax, scale and soft dust instead.
