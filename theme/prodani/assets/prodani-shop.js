/* Filter pills. Filters one rendered set client-side rather than navigating, so
   switching collections is instant. Each card carries the handles of every
   collection it belongs to; a pill matches against that list. */
(function () {
  if (window.__pdShop) return;
  window.__pdShop = true;

  function init() {
    document.querySelectorAll('.pd-shop').forEach(function (shop) {
      if (shop.dataset.pdBound) return;
      shop.dataset.pdBound = '1';

      var pills = shop.querySelectorAll('[data-pd-filter]');
      var items = shop.querySelectorAll('[data-pd-item]');
      var count = shop.querySelector('[data-pd-count]');
      if (!items.length) return;

      function apply(handle) {
        items.forEach(function (el) {
          var list = (el.dataset.collections || '').split(/\s+/);
          el.hidden = !(handle === '*' || list.indexOf(handle) !== -1);
        });
        // Hide a row whose cards are all filtered out, so no heading is left
        // stranded above an empty grid.
        shop.querySelectorAll('[data-pd-row]').forEach(function (row) {
          var only = row.dataset.pdOnly;
          if (only) {
            // An on-demand row: shown only while its own pill is active, and never
            // in the "All" view, where the composed rows are the intended shape.
            row.hidden = only !== handle;
            return;
          }
          row.hidden = row.querySelectorAll('[data-pd-item]:not([hidden])').length === 0;
        });

        if (count) {
          var shown = 0;
          shop.querySelectorAll('[data-pd-row]:not([hidden]) [data-pd-item]:not([hidden])')
              .forEach(function () { shown++; });
          count.textContent = 'Showing ' + shown + ' treat' + (shown === 1 ? '' : 's');
        }
      }

      pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          pills.forEach(function (p) { p.removeAttribute('data-on'); });
          pill.setAttribute('data-on', 'true');
          apply(pill.dataset.pdFilter);
        });
      });

      apply('*');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
  document.addEventListener('shopify:section:load', init);
})();
