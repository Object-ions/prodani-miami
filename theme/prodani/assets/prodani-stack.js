/* Scroll-linked scaling for the card deck. The prototype used framer-motion; a
   storefront should not ship a React runtime for one effect, so this is a plain
   scroll listener driving the same two transforms.
   - card scales down as later cards ride over it
   - its photo eases from a slight zoom to 1 as the slot enters
   Skipped entirely under prefers-reduced-motion. */
(function () {
  if (window.__pdStack) return;
  window.__pdStack = true;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  // Cards pin just below the sticky title — measure the title so the offset is exact.
  // Runs regardless of reduced-motion (it positions the deck, it isn't animation).
  function setHeadHeights() {
    document.querySelectorAll('[data-pd-stack]').forEach(function (stack) {
      var head = stack.querySelector('.pd-stack__head');
      if (head) stack.style.setProperty('--pd-stack-head-h', head.offsetHeight + 'px');
    });
  }

  function init() {
    setHeadHeights();
    window.addEventListener('resize', setHeadHeights);
    if (reduce) return;

    var stacks = document.querySelectorAll('[data-pd-stack]');
    if (!stacks.length) return;

    stacks.forEach(function (stack) {
      if (stack.dataset.pdBound) return;
      stack.dataset.pdBound = '1';

      var cards = stack.querySelectorAll('[data-pd-card]');
      if (!cards.length) return;

      var update = function () {
        var top = stack.getBoundingClientRect().top;
        var total = stack.offsetHeight - window.innerHeight;
        var progress = total > 0 ? clamp(-top / total, 0, 1) : 0;

        cards.forEach(function (card) {
          var i = +card.dataset.index;
          var n = +card.dataset.total;
          var target = 1 - (n - i) * 0.045;
          var start = i / n;
          var local = clamp((progress - start) / (1 - start || 1), 0, 1);
          card.style.transform = 'scale(' + (1 + (target - 1) * local) + ')';

          var media = card.querySelector('[data-pd-card-media]');
          if (media) {
            var slot = card.parentElement.getBoundingClientRect();
            var enter = clamp(1 - slot.top / window.innerHeight, 0, 1);
            media.style.transform = 'scale(' + (1.25 - 0.25 * enter) + ')';
          }
        });
      };

      update();
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
  document.addEventListener('shopify:section:load', init);
})();
