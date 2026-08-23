/* Rotates the announcement claims and flags the nav once the page is scrolled. */
(function () {
  if (window.__pdHeader) return;
  window.__pdHeader = true;

  function init() {
    var bar = document.querySelector('[data-pd-announce]');
    if (bar) {
      var items = bar.querySelectorAll('.pd-announce__track');
      if (items.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var i = 0;
        setInterval(function () {
          items[i].hidden = true;
          i = (i + 1) % items.length;
          items[i].hidden = false;
        }, 4200);
      }
    }

    var nav = document.querySelector('[data-pd-nav]');
    if (nav) {
      var onScroll = function () {
        nav.dataset.stuck = window.scrollY > 8 ? 'true' : 'false';
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
  document.addEventListener('shopify:section:load', init);
})();
