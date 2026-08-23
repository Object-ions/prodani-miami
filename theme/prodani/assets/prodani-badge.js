/* Fits the badge phrase to the circle so the ring closes, then spins it.
   Repeats the phrase as many WHOLE times as fit best (a partial repeat would
   break it mid-word at the seam), then corrects the remainder with font-size —
   size rather than tracking, so the letterspacing stays as designed. */
(function () {
  if (window.__pdBadge) return;
  window.__pdBadge = true;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fit(el) {
    var path = el.querySelector('defs path');
    var probe = el.querySelector('[data-pd-badge-probe]');
    var vis = el.querySelector('[data-pd-badge-text]');
    if (!path || !probe || !vis) return;
    var tp = vis.querySelector('textPath');

    var circumference = path.getTotalLength();
    // Zero while the badge is display:none — measuring then would fit it to nothing.
    var once = probe.getComputedTextLength();
    if (!once || !circumference) return;

    var reps = Math.max(1, Math.round(circumference / once));
    var base = parseFloat(getComputedStyle(probe).fontSize) || 17;
    var phrase = probe.textContent;
    var out = '';
    for (var i = 0; i < reps; i++) out += phrase;

    tp.textContent = out;
    tp.setAttribute('textLength', circumference);
    tp.setAttribute('lengthAdjust', 'spacing');
    vis.style.fontSize = (base * (circumference / (once * reps))) + 'px';
    vis.style.opacity = '1';
  }

  function spin(el) {
    if (reduce || el.dataset.pdSpinning) return;
    el.dataset.pdSpinning = '1';
    var svg = el.querySelector('svg');
    var seconds = parseFloat(el.dataset.speed) || 26;
    svg.style.animation = 'pd-badge-spin ' + seconds + 's linear infinite';
  }

  function init() {
    document.querySelectorAll('[data-pd-badge]').forEach(function (el) {
      fit(el); spin(el);
      // Konnect lands after first paint; refit against real metrics.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { fit(el); }).catch(function () {});
      }
    });
  }

  // The badge is display:none below 1100px, where the first measure can only
  // return zero. A ResizeObserver does NOT report a display:none -> visible
  // transition (verified in Chrome); window resize does, and it is the same
  // event that flips the breakpoint.
  window.addEventListener('resize', init);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
  document.addEventListener('shopify:section:load', init);
})();
