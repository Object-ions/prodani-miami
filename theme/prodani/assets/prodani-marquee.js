/* Scrolls the ribbon text along its path. The prototype used GSAP; a themed
   storefront should not pay 70KB for one loop, so this is a plain rAF driver.
   Two textPaths offset by 100% keep the seam invisible. Honours reduced motion. */
(function () {
  if (window.__pdMarquee) return;
  window.__pdMarquee = true;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function start(el) {
    if (el.dataset.pdRunning) return;
    el.dataset.pdRunning = '1';
    var tracks = el.querySelectorAll('[data-pd-track]');
    if (!tracks.length || reduce) return;

    /* Fit the text to the path. Without this the string overruns the path length
       and the two copies collide into each other — which is exactly the doubled,
       overlapping lettering the first build showed. */
    var path = el.querySelector('defs path');
    function fit() {
      if (!path || !path.getTotalLength) return;
      var pathLen = path.getTotalLength();
      for (var i = 0; i < tracks.length; i++) {
        var natural = tracks[i].getComputedTextLength();
        if (natural > pathLen) {
          tracks[i].setAttribute('textLength', pathLen);
          tracks[i].setAttribute('lengthAdjust', 'spacingAndGlyphs');
        }
      }
    }
    fit();
    // Konnect lands after first paint; refit against real metrics once it does.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit).catch(function () {});

    var seconds = parseFloat(el.dataset.speed) || 26;
    var last = null;
    var offset = 0;                       // 0 → 100 over `seconds`

    function frame(now) {
      if (last !== null) {
        offset += ((now - last) / 1000) * (100 / seconds);
        if (offset >= 100) offset -= 100;
        for (var i = 0; i < tracks.length; i++) {
          tracks[i].setAttribute('startOffset', (offset - i * 100) + '%');
        }
      }
      last = now;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function init() {
    document.querySelectorAll('[data-pd-marquee]').forEach(start);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
  // Theme editor re-renders sections without a page load.
  document.addEventListener('shopify:section:load', init);
})();
